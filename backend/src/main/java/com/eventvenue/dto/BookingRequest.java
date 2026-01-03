package com.eventvenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {
    private Long venueId;
    private Long eventId;
    private LocalDate bookingDate;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Integer durationHours;
    private Integer quantity; // For events
    private BigDecimal totalAmount;
    private Integer pointsToUse;
    private String paymentMethod; // POINTS, CARD, MIXED
}
