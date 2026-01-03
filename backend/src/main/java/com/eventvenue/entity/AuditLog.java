package com.eventvenue.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "action", nullable = false)
    private String action; // e.g., "USER_CREATED", "BOOKING_CONFIRMED", "VENDOR_APPROVED"
    
    @Column(name = "entity_type", nullable = false)
    private String entityType; // e.g., "USER", "BOOKING", "VENUE", "EVENT", "VENDOR"
    
    @Column(name = "entity_id")
    private Long entityId;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "performed_by")
    private String performedBy; // email or "SYSTEM"
    
    @Column(name = "user_role")
    private String userRole; // ADMIN, VENDOR, USER, SYSTEM
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
