package com.eventvenue.repository;

import com.eventvenue.entity.CreditRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditRequestRepository extends JpaRepository<CreditRequest, Long> {
    
    List<CreditRequest> findByUserId(Long userId);
    
    List<CreditRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<CreditRequest> findByStatus(String status);
    
    List<CreditRequest> findByStatusOrderByCreatedAtDesc(String status);
    
    List<CreditRequest> findByUserIdAndStatus(Long userId, String status);
    
    // For admin dashboard
    List<CreditRequest> findAllByOrderByCreatedAtDesc();
}
