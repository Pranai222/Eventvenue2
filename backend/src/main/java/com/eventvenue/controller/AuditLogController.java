package com.eventvenue.controller;

import com.eventvenue.entity.AuditLog;
import com.eventvenue.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {
    
    private final AuditLogService auditLogService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllLogs() {
        List<AuditLog> logs = auditLogService.getAllLogs();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", logs);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/entity/{entityType}")
    public ResponseEntity<Map<String, Object>> getLogsByEntityType(@PathVariable String entityType) {
        List<AuditLog> logs = auditLogService.getLogsByEntityType(entityType.toUpperCase());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", logs);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/action/{action}")
    public ResponseEntity<Map<String, Object>> getLogsByAction(@PathVariable String action) {
        List<AuditLog> logs = auditLogService.getLogsByAction(action.toUpperCase());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", logs);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/performer/{email}")
    public ResponseEntity<Map<String, Object>> getLogsByPerformer(@PathVariable String email) {
        List<AuditLog> logs = auditLogService.getLogsByPerformer(email);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", logs);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<Map<String, Object>> getLogsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
        LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
        List<AuditLog> logs = auditLogService.getLogsByDateRange(start, end);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", logs);
        return ResponseEntity.ok(response);
    }
}
