package com.eventvenue.controller;

import com.eventvenue.dto.ApiResponse;
import com.eventvenue.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000"})
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/platform-stats")
    public ResponseEntity<ApiResponse> getPlatformStats(Authentication authentication) {
        try {
            String role = (String) authentication.getCredentials();
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(403).body(ApiResponse.builder()
                        .success(false)
                        .message("Only admins can view platform statistics")
                        .build());
            }

            Map<String, Object> stats = analyticsService.getPlatformStats();
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Platform statistics retrieved successfully")
                    .data(stats)
                    .build());
        } catch (Exception e) {
            System.out.println("[pranai] Error getting platform stats: " + e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/vendor-stats")
    public ResponseEntity<ApiResponse> getVendorStats(Authentication authentication) {
        try {
            Map<String, Object> stats = analyticsService.getVendorStats();
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Vendor statistics retrieved successfully")
                    .data(stats)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/booking-stats")
    public ResponseEntity<ApiResponse> getBookingStats() {
        try {
            Map<String, Object> stats = analyticsService.getBookingStats();
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Booking statistics retrieved successfully")
                    .data(stats)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/user-stats")
    public ResponseEntity<ApiResponse> getUserStats() {
        try {
            Map<String, Object> stats = analyticsService.getUserStats();
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("User statistics retrieved successfully")
                    .data(stats)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
