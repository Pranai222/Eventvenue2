package com.eventvenue.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "transaction_type", nullable = false, length = 50)
   private String transactionType; // PURCHASE, REQUEST, WITHDRAWAL

    @Column(name = "amount_usd", precision = 10, scale = 2)
    private BigDecimal amountUsd;

    @Column(name = "points_amount", nullable = false)
    private Integer pointsAmount;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "stripe_payout_id")
    private String stripePayoutId;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // PENDING, COMPLETED, FAILED, APPROVED, REJECTED

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to create a purchase transaction
    public static CreditTransaction createPurchase(Long userId, BigDecimal amountUsd, Integer pointsAmount, String paymentIntentId) {
        CreditTransaction transaction = new CreditTransaction();
        transaction.setUserId(userId);
        transaction.setTransactionType("PURCHASE");
        transaction.setAmountUsd(amountUsd);
        transaction.setPointsAmount(pointsAmount);
        transaction.setStripePaymentIntentId(paymentIntentId);
        transaction.setStatus("PENDING");
        return transaction;
    }

    // Helper method to create a withdrawal transaction
    public static CreditTransaction createWithdrawal(Long userId, BigDecimal amountUsd, Integer pointsAmount) {
        CreditTransaction transaction = new CreditTransaction();
        transaction.setUserId(userId);
        transaction.setTransactionType("WITHDRAWAL");
        transaction.setAmountUsd(amountUsd);
        transaction.setPointsAmount(pointsAmount);
        transaction.setStatus("PENDING");
        return transaction;
    }
}
