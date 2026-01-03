package com.eventvenue.repository;

import com.eventvenue.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    
    List<AuditLog> findByEntityTypeOrderByCreatedAtDesc(String entityType);
    
    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);
    
    List<AuditLog> findByPerformedByOrderByCreatedAtDesc(String performedBy);
    
    List<AuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    List<AuditLog> findTop100ByOrderByCreatedAtDesc();
}
