package com.eventvenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // User info
    private Long userId;
    private String userName;
    private String userEmail;
    
    // Venue info (if venue review)
    private Long venueId;
    private String venueName;
    
    // Event info (if event review)
    private Long eventId;
    private String eventName;
    
    // Vendor info
    private Long vendorId;
    private String vendorName;
}
