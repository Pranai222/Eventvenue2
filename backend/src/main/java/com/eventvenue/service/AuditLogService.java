package com.eventvenue.service;

import com.eventvenue.entity.AuditLog;
import com.eventvenue.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    
    private final AuditLogRepository auditLogRepository;
    
    @Transactional
    public void log(String action, String entityType, Long entityId, String description, 
                   String performedBy, String userRole, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setDescription(description);
        auditLog.setPerformedBy(performedBy != null ? performedBy : "SYSTEM");
        auditLog.setUserRole(userRole != null ? userRole : "SYSTEM");
        auditLog.setIpAddress(ipAddress);
        auditLogRepository.save(auditLog);
    }
    
    @Transactional
    public void log(String action, String entityType, Long entityId, String description) {
        log(action, entityType, entityId, description, "SYSTEM", "SYSTEM", null);
    }
    
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc();
    }
    
    public List<AuditLog> getLogsByEntityType(String entityType) {
        return auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType);
    }
    
    public List<AuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByCreatedAtDesc(action);
    }
    
    public List<AuditLog> getLogsByPerformer(String performedBy) {
        return auditLogRepository.findByPerformedByOrderByCreatedAtDesc(performedBy);
    }
    
    public List<AuditLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
    }
}
