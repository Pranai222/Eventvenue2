package com.eventvenue.repository;

import com.eventvenue.entity.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    
    List<CreditTransaction> findByUserId(Long userId);
    
    List<CreditTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<CreditTransaction> findByTransactionType(String transactionType);
    
    List<CreditTransaction> findByStatus(String status);
    
    Optional<CreditTransaction> findByStripePaymentIntentId(String paymentIntentId);
    
    List<CreditTransaction> findByUserIdAndTransactionType(Long userId, String transactionType);
    
    List<CreditTransaction> findByUserIdAndStatus(Long userId, String status);
}
