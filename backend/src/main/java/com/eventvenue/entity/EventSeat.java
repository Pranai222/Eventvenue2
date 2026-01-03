package com.eventvenue.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_seats", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "row_label", "seat_number"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventSeat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "row_label", nullable = false, length = 5)
    private String rowLabel; // "A", "B", "C"

    @Column(nullable = false)
    private Integer seatNumber; // 1, 2, 3...

    @Column(length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, BOOKED, BLOCKED

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "booking_id")
    private Long bookingId; // Links to booking when booked

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "AVAILABLE";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
