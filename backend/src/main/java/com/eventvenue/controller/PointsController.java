package com.eventvenue.controller;

import com.eventvenue.dto.ApiResponse;
import com.eventvenue.dto.PurchasePointsRequest;
import com.eventvenue.entity.PointHistory;
import com.eventvenue.entity.User;
import com.eventvenue.service.PointsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/points")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000"})
public class PointsController {

    @Autowired
    private PointsService pointsService;

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse> getPointsBalance(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            Long points = pointsService.getUserPoints(userId);
            
            Map<String, Object> data = new HashMap<>();
            data.put("points", points);
            data.put("pointsPerDollar", pointsService.getPointsPerDollar());
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Points balance retrieved successfully")
                    .data(data)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse> getPointsHistory(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            List<PointHistory> history = pointsService.getUserPointsHistory(userId);
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Points history retrieved successfully")
                    .data(history)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/purchase")
    public ResponseEntity<ApiResponse> purchasePoints(
            @RequestBody PurchasePointsRequest request,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            
            // In a real app, this would integrate with a payment gateway (Stripe, PayPal, etc.)
            // For now, we'll simulate the purchase
            User updatedUser = pointsService.purchasePoints(
                    userId,
                    request.getPoints(),
                    request.getPaymentMethod(),
                    request.getTransactionId()
            );
            
            Map<String, Object> data = new HashMap<>();
            data.put("points", updatedUser.getPoints());
            data.put("pointsPurchased", request.getPoints());
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Points purchased successfully")
                    .data(data)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse> calculatePoints(@RequestParam Double amount) {
        try {
            Long pointsNeeded = pointsService.calculatePointsForAmount(amount);
            
            Map<String, Object> data = new HashMap<>();
            data.put("dollarAmount", amount);
            data.put("pointsNeeded", pointsNeeded);
            data.put("pointsPerDollar", pointsService.getPointsPerDollar());
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Points calculated successfully")
                    .data(data)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
