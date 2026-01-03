package com.eventvenue.service;

import com.eventvenue.entity.CreditRequest;
import com.eventvenue.entity.User;
import com.eventvenue.repository.CreditRequestRepository;
import com.eventvenue.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CreditRequestService {

    private final CreditRequestRepository creditRequestRepository;
    private final UserRepository userRepository;

    public CreditRequestService(
            CreditRequestRepository creditRequestRepository,
            UserRepository userRepository) {
        this.creditRequestRepository = creditRequestRepository;
        this.userRepository = userRepository;
    }

    /**
     * Submit a credit request
     */
    public CreditRequest submitRequest(Long userId, Integer pointsRequested, String reason) {
        CreditRequest request = new CreditRequest();
        request.setUserId(userId);
        request.setPointsRequested(pointsRequested);
        request.setReason(reason);
        request.setStatus("PENDING");
        
        return creditRequestRepository.save(request);
    }

    /**
     * Get all requests for a user
     */
    public List<CreditRequest> getUserRequests(Long userId) {
        return creditRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get all pending requests (for admin)
     */
    public List<CreditRequest> getPendingRequests() {
        return creditRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    /**
     * Get all requests (for admin)
     */
    public List<CreditRequest> getAllRequests() {
        return creditRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Approve a credit request
     */
    @Transactional
    public CreditRequest approveRequest(Long requestId, Long adminId, String notes) throws Exception {
        CreditRequest request = creditRequestRepository.findById(requestId)
                .orElseThrow(() -> new Exception("Request not found: " + requestId));

        if (!request.isPending()) {
            throw new Exception("Request is not pending. Current status: " + request.getStatus());
        }

        // Approve the request
        request.approve(adminId, notes);
        creditRequestRepository.save(request);

        // Add points to user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new Exception("User not found: " + request.getUserId()));

        Long currentPoints = user.getPoints() != null ? user.getPoints() : 0L;
        user.setPoints(currentPoints + request.getPointsRequested());
        userRepository.save(user);

        return request;
    }

    /**
     * Reject a credit request
     */
    @Transactional
    public CreditRequest rejectRequest(Long requestId, Long adminId, String notes) throws Exception {
        CreditRequest request = creditRequestRepository.findById(requestId)
                .orElseThrow(() -> new Exception("Request not found: " + requestId));

        if (!request.isPending()) {
            throw new Exception("Request is not pending. Current status: " + request.getStatus());
        }

        request.reject(adminId, notes);
        return creditRequestRepository.save(request);
    }
}
