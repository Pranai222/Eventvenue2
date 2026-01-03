package com.eventvenue.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seat_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(nullable = false)
    private String name; // "VIP", "First Class", "General"

    @Column(nullable = false)
    private BigDecimal price;

    @Column(length = 20)
    private String color = "#22c55e"; // For UI display

    @Column(name = "row_labels", columnDefinition = "TEXT", nullable = false)
    private String rows; // JSON array: ["A", "B", "C"]

    @Column(nullable = false)
    private Integer seatsPerRow;

    @Column(columnDefinition = "TEXT")
    private String aisleAfter; // "3,10" - gaps after seat 3 and 10

    @Column
    private Integer sortOrder = 0; // Display order (0 = top/closest to stage)

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (sortOrder == null) sortOrder = 0;
        if (color == null) color = "#22c55e";
    }
}
