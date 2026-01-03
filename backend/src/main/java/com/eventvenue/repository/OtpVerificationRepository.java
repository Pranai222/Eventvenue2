package com.eventvenue.repository;

import com.eventvenue.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmailAndOtpAndRoleAndIsUsedFalseAndExpiresAtAfter(
        String email, String otp, String role, LocalDateTime now
    );
    
    void deleteByEmailAndRole(String email, String role);
}
