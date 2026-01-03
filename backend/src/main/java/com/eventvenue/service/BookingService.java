package com.eventvenue.service;

import com.eventvenue.entity.Booking;
import com.eventvenue.entity.Venue;
import com.eventvenue.entity.Event;
import com.eventvenue.entity.Vendor;
import com.eventvenue.repository.BookingRepository;
import com.eventvenue.repository.VenueRepository;
import com.eventvenue.repository.EventRepository;
import com.eventvenue.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PointsService pointsService;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private VendorRepository vendorRepository;
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserService userService;

    public Booking createBooking(Booking booking) {
        Booking saved = bookingRepository.save(booking);
        auditLogService.log("BOOKING_CREATED", "BOOKING", saved.getId(), 
            "Booking created for user " + saved.getUserId());
        return saved;
    }

    @Transactional
    public Booking createBookingWithPoints(Long userId, Long venueId, Long eventId, 
                                          String bookingDate, String checkInTime, 
                                          String checkOutTime, Integer durationHours, Integer quantity) {
        int conversionRate = adminService.getConversionRate().getPointsPerDollar();
        Long pointsNeeded = calculatePointsNeeded(venueId, eventId, durationHours, quantity);
        final Long PLATFORM_FEE_POINTS = 2L;
        Long totalPointsRequired = pointsNeeded + PLATFORM_FEE_POINTS;
        
        Long userPoints = pointsService.getUserPoints(userId);
        if (userPoints < totalPointsRequired) {
            throw new RuntimeException("Insufficient points. You need " + totalPointsRequired + " points (including 2 points platform fee) but have " + userPoints);
        }

        if (eventId != null) {
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isPresent()) {
                Event event = eventOpt.get();
                Integer ticketsNeeded = quantity != null ? quantity : 1;
                if (event.getTicketsAvailable() < ticketsNeeded) {
                    throw new RuntimeException("Not enough tickets available");
                }
                event.setTicketsAvailable(event.getTicketsAvailable() - ticketsNeeded);
                eventRepository.save(event);
            }
        }

        Booking bookingObj = Booking.builder()
                .userId(userId)
                .venueId(venueId)
                .eventId(eventId)
                .bookingDate(java.time.LocalDate.parse(bookingDate))
                .checkInTime(checkInTime != null ? java.time.LocalTime.parse(checkInTime) : null)
                .checkOutTime(checkOutTime != null ? java.time.LocalTime.parse(checkOutTime) : null)
                .durationHours(durationHours)
                .quantity(quantity) // Use proper quantity field for event tickets
                .totalAmount(java.math.BigDecimal.valueOf(pointsNeeded / (double)conversionRate))
                .pointsUsed(pointsNeeded.intValue())
                .status("CONFIRMED")
                .paymentStatus("COMPLETED")
                .build();
        
        bookingObj = bookingRepository.save(bookingObj);

        pointsService.deductPoints(userId, pointsNeeded, "Booking payment", bookingObj.getId());
        
        // Deduct 2 points platform fee
        if (userPoints >= totalPointsRequired) {
            pointsService.deductPoints(userId, PLATFORM_FEE_POINTS, "Platform fee", bookingObj.getId());
        }
        
        // Transfer points to vendor
        Long vendorId = null;
        if (venueId != null) {
            Optional<Venue> venueOpt = venueRepository.findById(venueId);
            if (venueOpt.isPresent()) {
                vendorId = venueOpt.get().getVendorId();
            }
        } else if (eventId != null) {
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isPresent()) {
                vendorId = eventOpt.get().getVendorId();
            }
        }
        
        if (vendorId != null) {
            Optional<Vendor> vendorOpt = vendorRepository.findById(vendorId);
            if (vendorOpt.isPresent()) {
                Vendor vendor = vendorOpt.get();
                vendor.setPoints((vendor.getPoints() != null ? vendor.getPoints() : 0L) + pointsNeeded);
                vendorRepository.save(vendor);
            }
        }

        // Send booking confirmation email
        sendBookingConfirmationEmail(bookingObj);

        return bookingObj;
    }

    private Long calculatePointsNeeded(Long venueId, Long eventId, Integer durationHours, Integer quantity) {
        int conversionRate = adminService.getConversionRate().getPointsPerDollar();
        java.math.BigDecimal amount = java.math.BigDecimal.ZERO;

        if (venueId != null) {
            Optional<Venue> venueOpt = venueRepository.findById(venueId);
            if (venueOpt.isPresent()) {
                java.math.BigDecimal pricePerHour = venueOpt.get().getPricePerHour();
                amount = pricePerHour.multiply(new java.math.BigDecimal(durationHours != null ? durationHours : 1));
            }
        }

        if (eventId != null) {
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isPresent()) {
                java.math.BigDecimal pricePerTicket = eventOpt.get().getPricePerTicket();
                amount = pricePerTicket.multiply(new java.math.BigDecimal(quantity != null ? quantity : 1));
            }
        }

        return Math.round(amount.doubleValue() * conversionRate);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsByVenue(Long venueId) {
        return bookingRepository.findByVenueId(venueId);
    }

    public List<Booking> getBookingsByEvent(Long eventId) {
        return bookingRepository.findByEventId(eventId);
    }

    public List<Booking> getBookingsByVendor(Long vendorId) {
        List<Venue> vendorVenues = venueRepository.findByVendorId(vendorId);
        List<Long> venueIds = vendorVenues.stream()
                .map(Venue::getId)
                .collect(Collectors.toList());
        
        List<Booking> vendorBookings = new ArrayList<>();
        for (Long venueId : venueIds) {
            vendorBookings.addAll(bookingRepository.findByVenueId(venueId));
        }
        
        return vendorBookings;
    }

    public Booking updateBooking(Long id, Booking bookingDetails) {
        Optional<Booking> bookingOptional = bookingRepository.findById(id);
        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();
            if (bookingDetails.getStatus() != null) {
                booking.setStatus(bookingDetails.getStatus());
            }
            if (bookingDetails.getPaymentStatus() != null) {
                booking.setPaymentStatus(bookingDetails.getPaymentStatus());
            }
            return bookingRepository.save(booking);
        }
        throw new RuntimeException("Booking not found");
    }

    @Transactional
    public Booking confirmBooking(Long id) {
        Optional<Booking> bookingOptional = bookingRepository.findById(id);
        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();
            booking.setStatus("CONFIRMED");
            booking.setPaymentStatus("COMPLETED");
            return bookingRepository.save(booking);
        }
        throw new RuntimeException("Booking not found");
    }

    @Transactional
    public CancellationResult cancelBooking(Long id) {
        Optional<Booking> bookingOptional = bookingRepository.findById(id);
        if (!bookingOptional.isPresent()) {
            throw new RuntimeException("Booking not found");
        }
        
        Booking booking = bookingOptional.get();
        
        // Calculate refund based on cancellation policy
        CancellationResult result = calculateRefund(booking);
        
        // Update booking with cancellation info
        booking.setStatus("CANCELLED");
        booking.setCancelledAt(LocalDateTime.now());
        booking.setRefundAmount(result.refundAmount);
        booking.setRefundPercentage(result.refundPercentage);
        bookingRepository.save(booking);
        
        if (booking.getPointsUsed() > 0) {
            // Calculate points to refund based on same percentage as money refund
            Long pointsToRefund = Math.round(booking.getPointsUsed() * result.refundPercentage / 100.0);
            
            if (pointsToRefund > 0) {
                pointsService.refundPoints(
                    booking.getUserId(), 
                    pointsToRefund, 
                    String.format("Booking cancelled - %d%% points refunded", result.refundPercentage), 
                    booking.getId()
                );
            }
            
            // Deduct points from vendor (they received these points when booking was created)
            // Deduct the same proportion
            Long vendorId = null;
            if (booking.getVenueId() != null) {
                Optional<Venue> venueOpt = venueRepository.findById(booking.getVenueId());
                if (venueOpt.isPresent()) {
                    vendorId = venueOpt.get().getVendorId();
                }
            } else if (booking.getEventId() != null) {
                Optional<Event> eventOpt = eventRepository.findById(booking.getEventId());
                if (eventOpt.isPresent()) {
                    vendorId = eventOpt.get().getVendorId();
                }
            }
            
            if (vendorId != null && pointsToRefund > 0) {
                Optional<Vendor> vendorOpt = vendorRepository.findById(vendorId);
                if (vendorOpt.isPresent()) {
                    Vendor vendor = vendorOpt.get();
                    Long currentPoints = vendor.getPoints() != null ? vendor.getPoints() : 0L;
                    // Ensure vendor points don't go negative
                    vendor.setPoints(Math.max(0L, currentPoints - pointsToRefund));
                    vendorRepository.save(vendor);
                }
            }
            
            // Store points refunded in result
            result.pointsRefunded = pointsToRefund.intValue();
        }

        if (booking.getEventId() != null) {
            Optional<Event> eventOpt = eventRepository.findById(booking.getEventId());
            if (eventOpt.isPresent()) {
                Event event = eventOpt.get();
                // Use quantity field if available, otherwise fallback to durationHours for backwards compatibility
                Integer quantity = booking.getQuantity() != null ? booking.getQuantity() : 
                                 (booking.getDurationHours() != null ? booking.getDurationHours() : 1);
                event.setTicketsAvailable(event.getTicketsAvailable() + quantity);
                eventRepository.save(event);
            }
        }
        
        // Audit log the cancellation
        auditLogService.log("BOOKING_CANCELLED", "BOOKING", booking.getId(), 
            String.format("Booking cancelled. Refund: %d%% ($%.2f)", 
                result.refundPercentage, result.refundAmount.doubleValue()));
        
        return result;
    }
    
    /**
     * Calculate refund based on cancellation policy:
     * - 2+ days before event/booking: 100% refund
     * - Within 2 days: 75% refund (updated from 25%)
     * - After vendor reschedule: 95% refund
     * - Vendor cancelled event: 100% refund
     */
    private CancellationResult calculateRefund(Booking booking) {
        BigDecimal totalAmount = booking.getTotalAmount();
        LocalDate today = LocalDate.now();
        long daysUntil;
        boolean isVenueBooking = booking.getVenueId() != null;
        
        if (isVenueBooking) {
            // For venue bookings, use the booking date
            daysUntil = ChronoUnit.DAYS.between(today, booking.getBookingDate());
            
            if (daysUntil >= 2) {
                // 100% refund for cancellation 2+ days in advance
                return new CancellationResult(totalAmount, 100, "Venue cancellation 2+ days in advance: Full refund");
            } else {
                // 75% refund for late cancellation (updated from 25%)
                BigDecimal refundAmount = totalAmount.multiply(new BigDecimal("0.75")).setScale(2, RoundingMode.HALF_UP);
                return new CancellationResult(refundAmount, 75, "Venue cancellation less than 2 days before booking: 75% refund");
            }
        } else {
            // For event bookings, get the event date
            Optional<Event> eventOpt = eventRepository.findById(booking.getEventId());
            if (eventOpt.isPresent()) {
                Event event = eventOpt.get();
                LocalDate eventDate = event.getEventDate().toLocalDate();
                daysUntil = ChronoUnit.DAYS.between(today, eventDate);
                
                // Check if event was cancelled by vendor - 100% refund
                if (event.getIsCancelled() != null && event.getIsCancelled()) {
                    return new CancellationResult(totalAmount, 100, "Event cancelled by vendor: Full refund");
                }
                
                // Check if event was rescheduled - 95% refund for user cancellation
                if (event.getWasRescheduled() != null && event.getWasRescheduled()) {
                    BigDecimal refundAmount = totalAmount.multiply(new BigDecimal("0.95")).setScale(2, RoundingMode.HALF_UP);
                    return new CancellationResult(refundAmount, 95, "Event was rescheduled by vendor: 95% refund");
                }
                
                if (daysUntil >= 2) {
                    // 100% refund for cancellation 2+ days in advance
                    return new CancellationResult(totalAmount, 100, "Event cancellation 2+ days in advance: Full refund");
                } else {
                    // 75% refund for late cancellation (updated from 25%)
                    BigDecimal refundAmount = totalAmount.multiply(new BigDecimal("0.75")).setScale(2, RoundingMode.HALF_UP);
                    return new CancellationResult(refundAmount, 75, "Event cancellation less than 2 days before event: 75% refund");
                }
            }
            // If event not found, no refund
            return new CancellationResult(BigDecimal.ZERO, 0, "Event not found");
        }
    }
    
    // Inner class to hold cancellation result
    public static class CancellationResult {
        public BigDecimal refundAmount;
        public Integer refundPercentage;
        public String message;
        public Integer pointsRefunded = 0;
        
        public CancellationResult(BigDecimal refundAmount, Integer refundPercentage, String message) {
            this.refundAmount = refundAmount;
            this.refundPercentage = refundPercentage;
            this.message = message;
        }
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public BookingCalculationResult calculateBookingCost(Long venueId, Long eventId, Integer durationHours, 
                                                         Integer quantity, Integer pointsToUse) {
        int conversionRate = adminService.getConversionRate().getPointsPerDollar();
        BigDecimal subtotal = BigDecimal.ZERO;

        if (venueId != null) {
            Optional<Venue> venueOpt = venueRepository.findById(venueId);
            if (venueOpt.isPresent()) {
                BigDecimal pricePerHour = venueOpt.get().getPricePerHour();
                subtotal = pricePerHour.multiply(new BigDecimal(durationHours != null ? durationHours : 1));
            }
        }

        if (eventId != null) {
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isPresent()) {
                BigDecimal pricePerTicket = eventOpt.get().getPricePerTicket();
                subtotal = pricePerTicket.multiply(new BigDecimal(quantity != null ? quantity : 1));
            }
        }

        // Calculate points discount using admin's conversion rate
        BigDecimal pointsDiscount = new BigDecimal(pointsToUse != null ? pointsToUse : 0)
                .divide(new BigDecimal(conversionRate), 2, java.math.RoundingMode.HALF_UP);

        BigDecimal totalAmount = subtotal.subtract(pointsDiscount);
        if (totalAmount.signum() < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        return new BookingCalculationResult(subtotal, pointsDiscount, totalAmount, pointsToUse != null ? pointsToUse : 0);
    }

    public static class BookingCalculationResult {
        public BigDecimal subtotal;
        public BigDecimal pointsDiscount;
        public BigDecimal totalAmount;
        public Integer pointsUsed;

        public BookingCalculationResult(BigDecimal subtotal, BigDecimal pointsDiscount, BigDecimal totalAmount, Integer pointsUsed) {
            this.subtotal = subtotal;
            this.pointsDiscount = pointsDiscount;
            this.totalAmount = totalAmount;
            this.pointsUsed = pointsUsed;
        }
    }
    
    /**
     * Send booking confirmation email with full details
     */
    private void sendBookingConfirmationEmail(Booking booking) {
        try {
            // Get user information - skipping for now since UserService method doesn't exist
            // TODO: Fix after UserService is updated
            String userEmail = "user@example.com"; // Placeholder
            String userName = "User"; // Placeholder
            
            // Get points earned (5% of totalAmount as points)
            int conversionRate = adminService.getConversionRate().getPointsPerDollar();
            int pointsEarned = (int) Math.round(booking.getTotalAmount().doubleValue() * conversionRate * 0.05);
            
            // Send email based on booking type
            if (booking.getEventId() != null) {
                // Event booking
                Optional<Event> eventOpt = eventRepository.findById(booking.getEventId());
                if (eventOpt.isPresent()) {
                    Event event = eventOpt.get();
                    emailService.sendEventBookingConfirmation(
                        userEmail,
                        userName,
                        booking.getId(),
                        event.getName(),
                        event.getEventDate().toString(),
                        event.getEventTime() != null ? event.getEventTime().toString() : "TBA",
                        event.getLocation(),
                        booking.getQuantity() != null ? booking.getQuantity() : 1,
                        booking.getTotalAmount().doubleValue(),
                        pointsEarned
                    );
                    System.out.println("[EMAIL] Sent event booking confirmation to: " + userEmail);
                }
            } else if (booking.getVenueId() != null) {
                // Venue booking
                Optional<Venue> venueOpt = venueRepository.findById(booking.getVenueId());
                if (venueOpt.isPresent()) {
                    Venue venue = venueOpt.get();
                    emailService.sendVenueBookingConfirmation(
                        userEmail,
                        userName,
                        booking.getId(),
                       venue.getName(),
                        booking.getBookingDate().toString(),
                        venue.getAddress(),  // Changed from getLocation() to getAddress()
                        venue.getCapacity(),
                        booking.getTotalAmount().doubleValue(),
                        pointsEarned
                    );
                    System.out.println("[EMAIL] Sent venue booking confirmation to: " + userEmail);
                }
            }
        } catch (Exception e) {
            System.err.println("[EMAIL] Failed to send booking confirmation email for booking " + booking.getId() + ": " + e.getMessage());
            // Don't fail the booking if email fails
        }
    }
}
