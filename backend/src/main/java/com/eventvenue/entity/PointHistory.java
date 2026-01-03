package com.eventvenue.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "points_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "points_changed", nullable = false)
    private Long pointsChanged; // EXACT database field name

    @Column(name = "reason")
    private String reason;

    @Column(name = "previous_points")
    private Long previousPoints;

    @Column(name = "new_points")
    private Long newPoints;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (previousPoints == null) {
            previousPoints = 0L;
        }
        if (newPoints == null) {
            newPoints = 0L;
        }
    }
}
