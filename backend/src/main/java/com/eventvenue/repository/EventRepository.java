package com.eventvenue.repository;

import com.eventvenue.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByVendorId(Long vendorId);

    List<Event> findByIsActive(Boolean isActive);

    @Query("SELECT e FROM Event e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Event> search(@Param("query") String query);

    @Query("SELECT e FROM Event e WHERE " +
            "(:category IS NULL OR LOWER(e.category) = LOWER(:category)) AND " +
            "(:city IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
            "(:minPrice IS NULL OR e.pricePerTicket >= :minPrice) AND " +
            "(:maxPrice IS NULL OR e.pricePerTicket <= :maxPrice) AND " +
            "(:dateFrom IS NULL OR DATE(e.eventDate) >= :dateFrom) AND " +
            "(:dateTo IS NULL OR DATE(e.eventDate) <= :dateTo)")
    List<Event> filter(@Param("category") String category,
                       @Param("city") String city,
                       @Param("minPrice") BigDecimal minPrice,
                       @Param("maxPrice") BigDecimal maxPrice,
                       @Param("dateFrom") LocalDate dateFrom,
                       @Param("dateTo") LocalDate dateTo);
}
