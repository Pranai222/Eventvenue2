package com.eventvenue.repository;

import com.eventvenue.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByVendorId(Long vendorId);

    List<Venue> findByCity(String city);

    List<Venue> findByIsAvailable(Boolean isAvailable);

    List<Venue> findByCityAndIsAvailable(String city, Boolean isAvailable);

    @Query("SELECT v FROM Venue v WHERE LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Venue> search(@Param("query") String query);

    @Query("SELECT v FROM Venue v WHERE " +
            "(:city IS NULL OR LOWER(v.city) = LOWER(:city)) AND " +
            "(:category IS NULL OR LOWER(v.category) = LOWER(:category)) AND " +
            "(:minPrice IS NULL OR v.pricePerHour >= :minPrice) AND " +
            "(:maxPrice IS NULL OR v.pricePerHour <= :maxPrice) AND " +
            "(:capacity IS NULL OR v.capacity >= :capacity) AND " +
            "(:rating IS NULL OR v.rating >= :rating)")
    List<Venue> filter(@Param("city") String city,
                       @Param("category") String category,
                       @Param("minPrice") BigDecimal minPrice,
                       @Param("maxPrice") BigDecimal maxPrice,
                       @Param("capacity") Integer capacity,
                       @Param("rating") Double rating);

    @Query("SELECT v FROM Venue v WHERE v.rating >= 4.5 ORDER BY v.rating DESC")
    List<Venue> findFeatured();
}
