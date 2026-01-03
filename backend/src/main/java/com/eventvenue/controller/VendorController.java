package com.eventvenue.controller;

import com.eventvenue.dto.ApiResponse;
import com.eventvenue.entity.Vendor;
import com.eventvenue.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/vendor")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000"})
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getVendorProfile(Authentication authentication) {
        try {
            Long vendorId = Long.parseLong(authentication.getPrincipal().toString());
            Optional<Vendor> vendorOptional = vendorService.findById(vendorId);
            
            if (vendorOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.builder()
                        .success(false)
                        .message("Vendor not found")
                        .build());
            }

            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Vendor profile retrieved successfully")
                    .data(vendorOptional.get())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateVendorProfile(Authentication authentication, @RequestBody Vendor vendorDetails) {
        try {
            Long vendorId = Long.parseLong(authentication.getPrincipal().toString());
            Vendor updatedVendor = vendorService.updateVendor(vendorId, vendorDetails);
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Vendor profile updated successfully")
                    .data(updatedVendor)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
