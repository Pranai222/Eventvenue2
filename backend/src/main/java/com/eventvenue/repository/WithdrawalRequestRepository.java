package com.eventvenue.repository;

import com.eventvenue.entity.WithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
    
    List<WithdrawalRequest> findByUserId(Long userId);
    
    List<WithdrawalRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<WithdrawalRequest> findByStatus(String status);
    
    List<WithdrawalRequest> findByStatusOrderByCreatedAtDesc(String status);
    
    List<WithdrawalRequest> findByRequiresApproval(Boolean requiresApproval);
    
    List<WithdrawalRequest> findByRequiresApprovalAndStatus(Boolean requiresApproval, String status);
    
    List<WithdrawalRequest> findByUserIdAndStatus(Long userId, String status);
    
    // For admin dashboard - pending approvals >$1000
    List<WithdrawalRequest> findByRequiresApprovalTrueAndStatusOrderByCreatedAtDesc(String status);
}
