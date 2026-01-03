package com.eventvenue.service;

import com.eventvenue.entity.WithdrawalRequest;
import com.eventvenue.entity.User;
import com.eventvenue.entity.CreditTransaction;
import com.eventvenue.repository.WithdrawalRequestRepository;
import com.eventvenue.repository.UserRepository;
import com.eventvenue.repository.CreditTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class WithdrawalService {

    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final UserRepository userRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final StripePaymentService stripePaymentService;

    public WithdrawalService(
            WithdrawalRequestRepository withdrawalRequestRepository,
            UserRepository userRepository,
            CreditTransactionRepository creditTransactionRepository,
            StripePaymentService stripePaymentService) {
        this.withdrawalRequestRepository = withdrawalRequestRepository;
        this.userRepository = userRepository;
        this.creditTransactionRepository = creditTransactionRepository;
        this.stripePaymentService = stripePaymentService;
    }

    /**
     * Submit a withdrawal request
     */
    @Transactional
    public WithdrawalRequest submitWithdrawal(Long userId, Integer pointsAmount) throws Exception {
        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found: " + userId));

        // Check if user has enough points
        Long currentPoints = user.getPoints() != null ? user.getPoints() : 0L;
        if (currentPoints < pointsAmount) {
            throw new Exception("Insufficient points. Available: " + currentPoints + ", Requested: " + pointsAmount);
        }

        // Calculate USD amount
        BigDecimal amountUsd = stripePaymentService.calculateUsdFromPoints(pointsAmount);

        // Create withdrawal request
        WithdrawalRequest request = new WithdrawalRequest();
        request.setUserId(userId);
        request.setPointsAmount(pointsAmount);
        request.setAmountUsd(amountUsd);
        request.setStatus("PENDING");

        // Check if requires approval (>= $1000)
        boolean requiresApproval = request.requiresAdminApproval();
        request.setRequiresApproval(requiresApproval);

        return withdrawalRequestRepository.save(request);
    }

    /**
     * Get all withdrawal requests for a user
     */
    public List<WithdrawalRequest> getUserWithdrawals(Long userId) {
        return withdrawalRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get pending withdrawals that require approval (for admin)
     */
    public List<WithdrawalRequest> getPendingApprovals() {
        return withdrawalRequestRepository.findByRequiresApprovalTrueAndStatusOrderByCreatedAtDesc("PENDING");
    }

    /**
     * Approve a withdrawal request
     */
    @Transactional
    public WithdrawalRequest approveWithdrawal(Long withdrawalId, Long adminId, String notes) throws Exception {
        WithdrawalRequest request = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new Exception("Withdrawal request not found: " + withdrawalId));

        if (!request.isPending()) {
            throw new Exception("Withdrawal is not pending. Current status: " + request.getStatus());
        }

        request.approve(adminId, notes);
        return withdrawalRequestRepository.save(request);
    }

    /**
     * Reject a withdrawal request
     */
    @Transactional
    public WithdrawalRequest rejectWithdrawal(Long withdrawalId, Long adminId, String notes) throws Exception {
        WithdrawalRequest request = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new Exception("Withdrawal request not found: " + withdrawalId));

        if (!request.isPending()) {
            throw new Exception("Withdrawal is not pending. Current status: " + request.getStatus());
        }

        request.reject(adminId, notes);
        return withdrawalRequestRepository.save(request);
    }

    /**
     * Process a withdrawal (deduct points and create transaction)
     * Can be called directly for <$1000 or after admin approval
     */
    @Transactional
    public WithdrawalRequest processWithdrawal(Long withdrawalId, String cardLast4) throws Exception {
        WithdrawalRequest request = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new Exception("Withdrawal request not found: " + withdrawalId));

        // Check status - must be PENDING (for <$1000) or APPROVED (for >=$1000)
        if (request.getRequiresApproval() && !request.isApproved()) {
            throw new Exception("Withdrawal requires admin approval first");
        }

        if (!request.isPending() && !request.isApproved()) {
            throw new Exception("Invalid withdrawal status: " + request.getStatus());
        }

        // Deduct points from user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new Exception("User not found: " + request.getUserId()));

        Long currentPoints = user.getPoints() != null ? user.getPoints() : 0L;
        if (currentPoints < request.getPointsAmount()) {
            throw new Exception("Insufficient points");
        }

        user.setPoints(currentPoints - request.getPointsAmount());
        userRepository.save(user);

        // Create transaction record
        CreditTransaction transaction = CreditTransaction.createWithdrawal(
                request.getUserId(),
                request.getAmountUsd(),
                request.getPointsAmount()
        );
        transaction.setStatus("COMPLETED");
        transaction.setAdminNotes("Withdrawal processed. Card: ****" + cardLast4);
        creditTransactionRepository.save(transaction);

        // Update withdrawal request
        request.setStatus("COMPLETED");
        request.setCardLast4(cardLast4);
        // TODO: In production, integrate with actual Stripe payout/transfer
        request.setStripePayoutId("simulated_payout_" + System.currentTimeMillis());

        return withdrawalRequestRepository.save(request);
    }
}
