package com.eventvenue.repository;

import com.eventvenue.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Vendor> findByStatus(String status);
    List<Vendor> findByIsVerified(Boolean isVerified);
    List<Vendor> findByIsActive(Boolean isActive);
    
    long countByStatus(String status);
}
