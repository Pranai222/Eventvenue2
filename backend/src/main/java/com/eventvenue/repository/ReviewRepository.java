package com.eventvenue.repository;

import com.eventvenue.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByVenueId(Long venueId);
    List<Review> findByEventId(Long eventId);
    List<Review> findByUserId(Long userId);
    List<Review> findByVenueIdOrderByCreatedAtDesc(Long venueId);
    List<Review> findByEventIdOrderByCreatedAtDesc(Long eventId);
    
    // Check if user already reviewed
    Optional<Review> findByUserIdAndVenueId(Long userId, Long venueId);
    Optional<Review> findByUserIdAndEventId(Long userId, Long eventId);
    
    // Get reviews for vendor's venues
    @Query("SELECT r FROM Review r JOIN Venue v ON r.venueId = v.id WHERE v.vendorId = :vendorId ORDER BY r.createdAt DESC")
    List<Review> findVenueReviewsByVendorId(@Param("vendorId") Long vendorId);
    
    // Get reviews for vendor's events
    @Query("SELECT r FROM Review r JOIN Event e ON r.eventId = e.id WHERE e.vendorId = :vendorId ORDER BY r.createdAt DESC")
    List<Review> findEventReviewsByVendorId(@Param("vendorId") Long vendorId);
}
