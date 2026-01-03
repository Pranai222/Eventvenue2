package com.eventvenue.controller;

import com.eventvenue.dto.ApiResponse;
import com.eventvenue.dto.ReviewDTO;
import com.eventvenue.entity.Review;
import com.eventvenue.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000"})
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Create review (validates booking)
    @PostMapping
    public ResponseEntity<ApiResponse> createReview(@RequestBody Review review, Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            review.setUserId(userId);
            Review createdReview = reviewService.createReview(review);
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Review created successfully")
                    .data(createdReview)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    // Check if user can review (has booking, hasn't reviewed yet)
    @GetMapping("/can-review/venue/{venueId}")
    public ResponseEntity<ApiResponse> canReviewVenue(@PathVariable Long venueId, Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            boolean hasBooked = reviewService.hasUserBookedVenue(userId, venueId);
            boolean hasReviewed = reviewService.hasUserReviewedVenue(userId, venueId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("canReview", hasBooked && !hasReviewed);
            result.put("hasBooked", hasBooked);
            result.put("hasReviewed", hasReviewed);
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(result)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/can-review/event/{eventId}")
    public ResponseEntity<ApiResponse> canReviewEvent(@PathVariable Long eventId, Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            boolean hasBooked = reviewService.hasUserBookedEvent(userId, eventId);
            boolean hasReviewed = reviewService.hasUserReviewedEvent(userId, eventId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("canReview", hasBooked && !hasReviewed);
            result.put("hasBooked", hasBooked);
            result.put("hasReviewed", hasReviewed);
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(result)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllReviews() {
        try {
            List<ReviewDTO> reviews = reviewService.getAllReviewsDetailed();
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Reviews retrieved successfully")
                    .data(reviews)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getReview(@PathVariable Long id) {
        try {
            Optional<Review> review = reviewService.getReviewById(id);
            if (review.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.builder()
                        .success(false)
                        .message("Review not found")
                        .build());
            }
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(review.get())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<ApiResponse> getVenueReviews(@PathVariable Long venueId) {
        try {
            List<Review> reviews = reviewService.getVenueReviews(venueId);
            Double avgRating = reviewService.getVenueAverageRating(venueId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("reviews", reviews);
            result.put("averageRating", avgRating);
            result.put("totalReviews", reviews.size());
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(result)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse> getEventReviews(@PathVariable Long eventId) {
        try {
            List<Review> reviews = reviewService.getEventReviews(eventId);
            Double avgRating = reviewService.getEventAverageRating(eventId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("reviews", reviews);
            result.put("averageRating", avgRating);
            result.put("totalReviews", reviews.size());
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(result)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    // User's own reviews
    @GetMapping("/user/my-reviews")
    public ResponseEntity<ApiResponse> getMyReviews(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            List<Review> reviews = reviewService.getUserReviews(userId);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(reviews)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    // Vendor's reviews (for their venues/events)
    @GetMapping("/vendor/my-reviews")
    public ResponseEntity<ApiResponse> getVendorReviews(Authentication authentication) {
        try {
            Long vendorId = Long.parseLong(authentication.getPrincipal().toString());
            List<ReviewDTO> reviews = reviewService.getVendorReviewsDetailed(vendorId);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(reviews)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    // Update own review
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateReview(@PathVariable Long id, @RequestBody Review reviewDetails, Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            Review updatedReview = reviewService.updateReviewByOwner(userId, id, reviewDetails);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Review updated successfully")
                    .data(updatedReview)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    // User deletes own review
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getPrincipal().toString());
            reviewService.deleteReviewByOwner(userId, id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Review deleted successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    // Vendor deletes review for their venue/event
    @DeleteMapping("/vendor/{id}")
    public ResponseEntity<ApiResponse> vendorDeleteReview(@PathVariable Long id, Authentication authentication) {
        try {
            Long vendorId = Long.parseLong(authentication.getPrincipal().toString());
            reviewService.deleteReviewByVendor(vendorId, id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Review deleted successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    // Admin deletes any review
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiResponse> adminDeleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReviewByAdmin(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Review deleted successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/venue/{venueId}/average")
    public ResponseEntity<ApiResponse> getVenueAverageRating(@PathVariable Long venueId) {
        try {
            Double avgRating = reviewService.getVenueAverageRating(venueId);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(avgRating)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/event/{eventId}/average")
    public ResponseEntity<ApiResponse> getEventAverageRating(@PathVariable Long eventId) {
        try {
            Double avgRating = reviewService.getEventAverageRating(eventId);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .data(avgRating)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}

