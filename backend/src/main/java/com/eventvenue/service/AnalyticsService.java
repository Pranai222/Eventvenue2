package com.eventvenue.service;

import com.eventvenue.dto.ApiResponse;
import com.eventvenue.repository.UserRepository;
import com.eventvenue.repository.VendorRepository;
import com.eventvenue.repository.VenueRepository;
import com.eventvenue.repository.BookingRepository;
import com.eventvenue.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();

        // User statistics
        stats.put("totalUsers", userRepository.count());
        stats.put("approvedVendors", vendorRepository.countByStatus("APPROVED"));
        stats.put("pendingVendors", vendorRepository.countByStatus("PENDING"));
        stats.put("rejectedVendors", vendorRepository.countByStatus("REJECTED"));

        // Venue statistics
        stats.put("totalVenues", venueRepository.count());
        stats.put("availableVenues", (long) venueRepository.findByIsAvailable(true).size());

        // Booking statistics
        stats.put("totalBookings", bookingRepository.count());
        stats.put("completedBookings", bookingRepository.countByStatus("COMPLETED"));
        stats.put("pendingBookings", bookingRepository.countByStatus("PENDING"));
        stats.put("cancelledBookings", bookingRepository.countByStatus("CANCELLED"));

        // Event statistics
        stats.put("totalEvents", eventRepository.count());
        stats.put("activeEvents", (long) eventRepository.findByIsActive(true).size());

        // Revenue statistics (mock data - would need payment table)
        stats.put("totalRevenue", BigDecimal.ZERO);
        stats.put("monthlyRevenue", BigDecimal.ZERO);

        return stats;
    }

    public Map<String, Object> getVendorStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVendors", vendorRepository.count());
        stats.put("approvedVendors", vendorRepository.countByStatus("APPROVED"));
        stats.put("pendingVendors", vendorRepository.countByStatus("PENDING"));
        stats.put("rejectedVendors", vendorRepository.countByStatus("REJECTED"));
        stats.put("activeVendors", (long) vendorRepository.findByIsActive(true).size());
        return stats;
    }

    public Map<String, Object> getBookingStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", bookingRepository.count());
        stats.put("completedBookings", bookingRepository.countByStatus("COMPLETED"));
        stats.put("pendingBookings", bookingRepository.countByStatus("PENDING"));
        stats.put("cancelledBookings", bookingRepository.countByStatus("CANCELLED"));
        stats.put("confirmedBookings", bookingRepository.countByStatus("CONFIRMED"));
        return stats;
    }

    public Map<String, Object> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        long totalPoints = userRepository.findAll().stream()
                .mapToLong(user -> user.getPoints() != null ? user.getPoints() : 0L)
                .sum();
        stats.put("totalPointsDistributed", totalPoints);
        stats.put("averageUserPoints", totalPoints / Math.max(userRepository.count(), 1));
        return stats;
    }
}
