package com.eventvenue.service;

import com.eventvenue.entity.OtpVerification;
import com.eventvenue.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpVerificationRepository otpRepository;

    @Autowired
    private EmailService emailService;

    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    @Transactional
    public void sendOtp(String email, String role) {
        System.out.println("[pranai] ===== SENDING OTP =====");
        System.out.println("[pranai] Email: " + email);
        System.out.println("[pranai] Role: " + role);
        
        // Delete any existing OTPs for this email and role
        otpRepository.deleteByEmailAndRole(email, role);

        // Generate new OTP
        String otp = generateOtp();
        
        System.out.println("[pranai] Generated OTP: " + otp);

        // Save OTP to database
        OtpVerification otpVerification = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .role(role)
                .isUsed(false)
                .build();
        OtpVerification saved = otpRepository.save(otpVerification);
        
        System.out.println("[OTP] Saved OTP - ID: " + saved.getId() + ", ExpiresAt: " + saved.getExpiresAt());

        // Send OTP via email with role-specific template
        emailService.sendOtpEmail(email, otp, role);
        
        System.out.println("[OTP] Professional welcome email sent to " + email);
        System.out.println("[OTP] OTP code for testing: " + otp);
        System.out.println("[OTP] =======================");
    }

    public boolean verifyOtp(String email, String otp, String role) {
        System.out.println("[pranai] ===== VERIFYING OTP =====");
        System.out.println("[pranai] Email: " + email);
        System.out.println("[pranai] OTP: " + otp);
        System.out.println("[pranai] Role: " + role);
        System.out.println("[pranai] Current time: " + LocalDateTime.now());
        
        Optional<OtpVerification> otpOptional = otpRepository
                .findByEmailAndOtpAndRoleAndIsUsedFalseAndExpiresAtAfter(
                        email, otp, role, LocalDateTime.now()
                );

        if (otpOptional.isEmpty()) {
            System.out.println("[pranai] OTP NOT FOUND in database with given criteria");
            System.out.println("[pranai] Checking all OTPs for this email...");
            
            // Debug query to see what exists
            otpRepository.findAll().stream()
                .filter(o -> o.getEmail().equals(email))
                .forEach(o -> {
                    System.out.println("[pranai] Found OTP: " + o.getOtp() + 
                        ", Role: " + o.getRole() + 
                        ", IsUsed: " + o.getIsUsed() + 
                        ", ExpiresAt: " + o.getExpiresAt() +
                        ", IsExpired: " + o.getExpiresAt().isBefore(LocalDateTime.now()));
                });
            System.out.println("[pranai] =========================");
            return false;
        }

        OtpVerification otpVerification = otpOptional.get();
        System.out.println("[pranai] OTP FOUND - Marking as used");
        otpVerification.setIsUsed(true);
        otpRepository.save(otpVerification);
        System.out.println("[pranai] OTP verification successful!");
        System.out.println("[pranai] =========================");
        return true;
    }
}
