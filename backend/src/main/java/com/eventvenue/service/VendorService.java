package com.eventvenue.service;

import com.eventvenue.dto.AuthResponse;
import com.eventvenue.dto.SignupRequest;
import com.eventvenue.entity.Vendor;
import com.eventvenue.entity.User;
import com.eventvenue.repository.VendorRepository;
import com.eventvenue.repository.UserRepository;
import com.eventvenue.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private AuditLogService auditLogService;

    public AuthResponse registerVendorResponse(SignupRequest request) {
        // Check if email already registered as VENDOR (allow same email for different roles)
        if (vendorRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered as a vendor");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role("VENDOR")
                .points(0L)
                .isVerified(false)
                .build();

        user = userRepository.save(user);

        Vendor vendor = Vendor.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .businessName(request.getBusinessName())
                .description(request.getBusinessDescription())
                .businessPhone(request.getBusinessPhone())
                .businessAddress(request.getBusinessAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .status("PENDING")
                .isVerified(false)
                .isActive(true)
                .rating(0.0)
                .totalVenues(0)
                .build();

        vendor = vendorRepository.save(vendor);
        
        // Audit log vendor registration
        auditLogService.log("VENDOR_REGISTERED", "VENDOR", vendor.getId(), 
            "New vendor registered: " + vendor.getBusinessName() + " (" + vendor.getEmail() + ")");

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), "VENDOR");

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role("VENDOR")
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .businessName(vendor.getBusinessName())
                .businessDescription(vendor.getDescription())
                .message("Vendor registered successfully. Pending admin approval")
                .build();
    }

    public Vendor registerVendor(String businessName, String email, String password) {
        if (vendorRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        Vendor vendor = Vendor.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .businessName(businessName)
                .status("PENDING")
                .isVerified(false)
                .isActive(true)
                .rating(0.0)
                .totalVenues(0)
                .build();

        return vendorRepository.save(vendor);
    }

    public Optional<Vendor> findByEmail(String email) {
        return vendorRepository.findByEmail(email);
    }

    public Optional<Vendor> findById(Long id) {
        return vendorRepository.findById(id);
    }

    public List<Vendor> getAllPendingVendors() {
        return vendorRepository.findByStatus("PENDING");
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public List<Vendor> getPendingVendors() {
        return vendorRepository.findByStatus("PENDING");
    }

    public void deleteVendor(Long vendorId) {
        if (!vendorRepository.existsById(vendorId)) {
            throw new RuntimeException("Vendor not found");
        }
        vendorRepository.deleteById(vendorId);
    }

    public Vendor approveVendor(Long vendorId) {
        Optional<Vendor> vendorOptional = vendorRepository.findById(vendorId);
        if (vendorOptional.isPresent()) {
            Vendor vendor = vendorOptional.get();
            vendor.setStatus("APPROVED");
            vendor.setIsVerified(true);
            Vendor saved = vendorRepository.save(vendor);
            
            // Audit log vendor approval
            auditLogService.log("VENDOR_APPROVED", "VENDOR", vendor.getId(), 
                "Vendor approved: " + vendor.getBusinessName(), "ADMIN", "ADMIN", null);
            
            return saved;
        }
        throw new RuntimeException("Vendor not found");
    }

    public Vendor rejectVendor(Long vendorId, String reason) {
        Optional<Vendor> vendorOptional = vendorRepository.findById(vendorId);
        if (vendorOptional.isPresent()) {
            Vendor vendor = vendorOptional.get();
            vendor.setStatus("REJECTED");
            Vendor saved = vendorRepository.save(vendor);
            
            // Audit log vendor rejection
            auditLogService.log("VENDOR_REJECTED", "VENDOR", vendor.getId(), 
                "Vendor rejected: " + vendor.getBusinessName() + ". Reason: " + reason, "ADMIN", "ADMIN", null);
            
            return saved;
        }
        throw new RuntimeException("Vendor not found");
    }

    public Vendor updateVendor(Long vendorId, Vendor vendorDetails) {
        Optional<Vendor> vendorOptional = vendorRepository.findById(vendorId);
        if (vendorOptional.isPresent()) {
            Vendor vendor = vendorOptional.get();
            if (vendorDetails.getBusinessPhone() != null) {
                vendor.setBusinessPhone(vendorDetails.getBusinessPhone());
            }
            if (vendorDetails.getBusinessAddress() != null) {
                vendor.setBusinessAddress(vendorDetails.getBusinessAddress());
            }
            if (vendorDetails.getCity() != null) {
                vendor.setCity(vendorDetails.getCity());
            }
            if (vendorDetails.getState() != null) {
                vendor.setState(vendorDetails.getState());
            }
            if (vendorDetails.getPincode() != null) {
                vendor.setPincode(vendorDetails.getPincode());
            }
            if (vendorDetails.getDescription() != null) {
                vendor.setDescription(vendorDetails.getDescription());
            }
            return vendorRepository.save(vendor);
        }
        throw new RuntimeException("Vendor not found");
    }

    // Overloaded method for updating vendor directly (used by OTP verification)
    public Vendor updateVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }
}
