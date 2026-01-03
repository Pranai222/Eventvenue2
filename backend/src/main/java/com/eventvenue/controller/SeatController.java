package com.eventvenue.controller;

import com.eventvenue.entity.Booking;
import com.eventvenue.entity.User;
import com.eventvenue.repository.UserRepository;
import com.eventvenue.service.SeatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events/{eventId}/seats")
@RequiredArgsConstructor
@Slf4j
public class SeatController {

    private final SeatService seatService;
    private final UserRepository userRepository;

    /**
     * Get seat layout for an event
     */
    @GetMapping
    public ResponseEntity<?> getSeatLayout(@PathVariable Long eventId) {
        try {
            Map<String, Object> layout = seatService.getSeatLayout(eventId);
            return ResponseEntity.ok(layout);
        } catch (Exception e) {
            log.error("Error getting seat layout for event {}", eventId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to get seat layout: " + e.getMessage()
            ));
        }
    }

    /**
     * Create seat layout for an event (vendor only)
     */
    @PostMapping("/configure")
    public ResponseEntity<?> configureSeatLayout(
            @PathVariable Long eventId,
            @RequestBody List<Map<String, Object>> categories,
            Authentication authentication) {
        try {
            seatService.createSeatLayout(eventId, categories);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Seat layout configured successfully"
            ));
        } catch (Exception e) {
            log.error("Error configuring seat layout for event {}", eventId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to configure seat layout: " + e.getMessage()
            ));
        }
    }

    /**
     * Book selected seats (user)
     */
    @PostMapping("/book")
    public ResponseEntity<?> bookSeats(
            @PathVariable Long eventId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> seatIds = ((List<?>) request.get("seatIds")).stream()
                    .map(id -> Long.valueOf(id.toString()))
                    .toList();
            int pointsToUse = request.get("pointsToUse") != null 
                    ? Integer.parseInt(request.get("pointsToUse").toString()) 
                    : 0;

            // Get user ID from authentication (JWT sets userId as principal)
            Long userId = Long.parseLong(authentication.getName());

            Booking booking = seatService.bookSeats(eventId, seatIds, userId, pointsToUse);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Seats booked successfully",
                "bookingId", booking.getId(),
                "totalAmount", booking.getTotalAmount(),
                "quantity", booking.getQuantity()
            ));
        } catch (RuntimeException e) {
            log.error("Error booking seats for event {}", eventId, e);
            return ResponseEntity.status(409).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error booking seats for event {}", eventId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to book seats: " + e.getMessage()
            ));
        }
    }
}

