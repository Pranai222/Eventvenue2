package com.eventvenue.controller;

import com.eventvenue.dto.ApiResponse;
import com.eventvenue.entity.User;
import com.eventvenue.entity.PointHistory;
import com.eventvenue.service.UserService;
import com.eventvenue.repository.PointHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PointHistoryRepository pointHistoryRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getUserProfile(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            
            Optional<User> userOptional = userService.findById(userId);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.builder()
                        .success(false)
                        .message("User not found")
                        .build());
            }

            User user = userOptional.get();

            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("User profile retrieved successfully")
                    .data(user)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateUserProfile(Authentication authentication, @RequestBody User userDetails) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            User updatedUser = userService.updateUser(userId, userDetails);
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("User profile updated successfully")
                    .data(updatedUser)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/points/history")
    public ResponseEntity<ApiResponse> getPointsHistory(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            List<PointHistory> history = pointHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
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

    @GetMapping("/points/{userId}")
    public ResponseEntity<ApiResponse> getUserPoints(@PathVariable Long userId) {
        try {
            Optional<User> userOptional = userService.findById(userId);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.builder()
                        .success(false)
                        .message("User not found")
                        .build());
            }

            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("User points retrieved")
                    .data(userOptional.get().getPoints())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
