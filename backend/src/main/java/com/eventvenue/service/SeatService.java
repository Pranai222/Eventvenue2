package com.eventvenue.service;

import com.eventvenue.entity.EventSeat;
import com.eventvenue.entity.SeatCategory;
import com.eventvenue.entity.Event;
import com.eventvenue.entity.Booking;
import com.eventvenue.repository.EventSeatRepository;
import com.eventvenue.repository.SeatCategoryRepository;
import com.eventvenue.repository.EventRepository;
import com.eventvenue.repository.BookingRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatService {

    private final SeatCategoryRepository seatCategoryRepository;
    private final EventSeatRepository eventSeatRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper;

    /**
     * Create or update seat layout for an event
     * Preserves booked seats - only unbooked seats can be modified
     */
    @Transactional
    public void createSeatLayout(Long eventId, List<Map<String, Object>> categories) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Get existing booked seats (these cannot be deleted or modified)
        List<EventSeat> bookedSeats = eventSeatRepository.findByEventIdAndStatus(eventId, "BOOKED");
        Set<String> bookedSeatKeys = new HashSet<>();
        for (EventSeat seat : bookedSeats) {
            bookedSeatKeys.add(seat.getRowLabel() + "-" + seat.getSeatNumber());
        }
        
        log.info("Found {} booked seats that will be preserved", bookedSeats.size());

        // Delete only available seats (not booked ones)
        List<EventSeat> allSeats = eventSeatRepository.findByEventIdOrderByRowLabelAscSeatNumberAsc(eventId);
        List<EventSeat> seatsToDelete = new ArrayList<>();
        for (EventSeat seat : allSeats) {
            if (!"BOOKED".equals(seat.getStatus())) {
                seatsToDelete.add(seat);
            }
        }
        
        if (!seatsToDelete.isEmpty()) {
            eventSeatRepository.deleteAll(seatsToDelete);
            eventSeatRepository.flush(); // Force database synchronization
            log.info("Deleted {} available seats", seatsToDelete.size());
        }
        
        // Delete existing categories (we'll recreate them and remap booked seats)
        List<SeatCategory> oldCategories = seatCategoryRepository.findByEventIdOrderBySortOrderAsc(eventId);
        Map<Long, SeatCategory> oldCategoryMap = new HashMap<>();
        for (SeatCategory cat : oldCategories) {
            oldCategoryMap.put(cat.getId(), cat);
        }
        seatCategoryRepository.deleteByEventId(eventId);

        int totalSeats = 0;
        Map<String, Long> rowToCategoryId = new HashMap<>(); // Maps row label to new category ID

        for (int i = 0; i < categories.size(); i++) {
            Map<String, Object> catData = categories.get(i);
            
            SeatCategory category = SeatCategory.builder()
                    .eventId(eventId)
                    .name((String) catData.get("name"))
                    .price(new BigDecimal(catData.get("price").toString()))
                    .color((String) catData.getOrDefault("color", "#22c55e"))
                    .rows("[]")
                    .seatsPerRow(((Number) catData.get("seatsPerRow")).intValue())
                    .aisleAfter((String) catData.getOrDefault("aisleAfter", ""))
                    .sortOrder(i)
                    .build();

            // Convert rows list to JSON string
            Object rowsObj = catData.get("rows");
            if (rowsObj instanceof List) {
                try {
                    category.setRows(objectMapper.writeValueAsString(rowsObj));
                } catch (JsonProcessingException e) {
                    log.error("Error serializing rows", e);
                    category.setRows("[]");
                }
            } else if (rowsObj instanceof String) {
                category.setRows((String) rowsObj);
            }

            category = seatCategoryRepository.save(category);

            // Map each row to this category
            List<String> rows = parseRows(category.getRows());
            for (String row : rows) {
                rowToCategoryId.put(row, category.getId());
            }

            int seatsPerRow = category.getSeatsPerRow();

            for (String row : rows) {
                for (int seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                    String seatKey = row + "-" + seatNum;
                    
                    if (bookedSeatKeys.contains(seatKey)) {
                    // This seat is booked - update its category reference
                    // Query the seat from database to get a managed entity
                    Optional<EventSeat> managedSeatOpt = eventSeatRepository
                            .findByEventIdAndRowLabelAndSeatNumber(eventId, row, seatNum);
                    
                    if (managedSeatOpt.isPresent()) {
                        EventSeat managedSeat = managedSeatOpt.get();
                        managedSeat.setCategoryId(category.getId());
                        managedSeat.setPrice(category.getPrice());
                        eventSeatRepository.save(managedSeat);  // Now it's an UPDATE, not INSERT
                        totalSeats++;
                    } else {
                        log.warn("Booked seat {}-{} not found in database for event {}", row, seatNum, eventId);
                    }
                } else {
                        // Create new available seat
                        EventSeat seat = EventSeat.builder()
                                .eventId(eventId)
                                .categoryId(category.getId())
                                .rowLabel(row)
                                .seatNumber(seatNum)
                                .status("AVAILABLE")
                                .price(category.getPrice())
                                .build();
                        eventSeatRepository.save(seat);
                        totalSeats++;
                    }
                }
            }
        }

        // Update event with total seats
        event.setTotalTickets(totalSeats);
        event.setTicketsAvailable(totalSeats - bookedSeats.size());
        event.setBookingType("SEAT_SELECTION");
        eventRepository.save(event);

        log.info("Updated seat layout for event {} with {} total seats ({} booked, {} available)", 
                eventId, totalSeats, bookedSeats.size(), totalSeats - bookedSeats.size());
    }

    /**
     * Get seat layout for an event
     */
    public Map<String, Object> getSeatLayout(Long eventId) {
        List<SeatCategory> categories = seatCategoryRepository.findByEventIdOrderBySortOrderAsc(eventId);
        List<EventSeat> seats = eventSeatRepository.findByEventIdOrderByRowLabelAscSeatNumberAsc(eventId);

        // Convert categories to maps with parsed rows
        List<Map<String, Object>> categoryList = new ArrayList<>();
        for (SeatCategory cat : categories) {
            Map<String, Object> catMap = new HashMap<>();
            catMap.put("id", cat.getId());
            catMap.put("name", cat.getName());
            catMap.put("price", cat.getPrice());
            catMap.put("color", cat.getColor());
            catMap.put("rows", parseRows(cat.getRows()));
            catMap.put("seatsPerRow", cat.getSeatsPerRow());
            catMap.put("aisleAfter", parseAisles(cat.getAisleAfter()));
            catMap.put("sortOrder", cat.getSortOrder());
            categoryList.add(catMap);
        }

        // Convert seats to maps
        List<Map<String, Object>> seatList = new ArrayList<>();
        for (EventSeat seat : seats) {
            Map<String, Object> seatMap = new HashMap<>();
            seatMap.put("id", seat.getId());
            seatMap.put("rowLabel", seat.getRowLabel());
            seatMap.put("seatNumber", seat.getSeatNumber());
            seatMap.put("status", seat.getStatus());
            seatMap.put("price", seat.getPrice());
            seatMap.put("categoryId", seat.getCategoryId());
            seatList.add(seatMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("categories", categoryList);
        result.put("seats", seatList);
        return result;
    }

    /**
     * Book selected seats atomically
     */
    @Transactional
    public Booking bookSeats(Long eventId, List<Long> seatIds, Long userId, int pointsToUse) {
        // Get seats with pessimistic lock to prevent race conditions
        List<EventSeat> seats = eventSeatRepository.findByIdInAndStatusWithLock(seatIds, "AVAILABLE");

        if (seats.size() != seatIds.size()) {
            throw new RuntimeException("Some seats are no longer available");
        }

        // Calculate total amount
        BigDecimal totalAmount = seats.stream()
                .map(EventSeat::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create booking
        Booking booking = Booking.builder()
                .userId(userId)
                .eventId(eventId)
                .bookingDate(LocalDate.now())
                .quantity(seats.size())
                .totalAmount(totalAmount)
                .pointsUsed(pointsToUse)
                .status("CONFIRMED")
                .paymentStatus("COMPLETED")
                .build();

        // Set seat IDs as JSON
        try {
            booking.setSeatIds(objectMapper.writeValueAsString(seatIds));
        } catch (JsonProcessingException e) {
            log.error("Error serializing seat IDs", e);
        }

        booking = bookingRepository.save(booking);

        // Update seats to BOOKED
        for (EventSeat seat : seats) {
            seat.setStatus("BOOKED");
            seat.setBookingId(booking.getId());
            eventSeatRepository.save(seat);
        }

        // Update event available tickets
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null) {
            event.setTicketsAvailable(event.getTicketsAvailable() - seats.size());
            eventRepository.save(event);
        }

        log.info("Booked {} seats for event {} by user {}", seats.size(), eventId, userId);
        return booking;
    }

    /**
     * Release seats when booking is cancelled
     */
    @Transactional
    public void releaseSeats(Long bookingId) {
        List<EventSeat> seats = eventSeatRepository.findByBookingId(bookingId);
        
        for (EventSeat seat : seats) {
            seat.setStatus("AVAILABLE");
            seat.setBookingId(null);
            eventSeatRepository.save(seat);
        }

        // Update event available tickets
        if (!seats.isEmpty()) {
            Long eventId = seats.get(0).getEventId();
            Event event = eventRepository.findById(eventId).orElse(null);
            if (event != null) {
                event.setTicketsAvailable(event.getTicketsAvailable() + seats.size());
                eventRepository.save(event);
            }
        }

        log.info("Released {} seats for booking {}", seats.size(), bookingId);
    }

    private List<String> parseRows(String rowsJson) {
        if (rowsJson == null || rowsJson.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(rowsJson, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error parsing rows JSON", e);
            return new ArrayList<>();
        }
    }

    private List<Integer> parseAisles(String aisleAfter) {
        if (aisleAfter == null || aisleAfter.isEmpty()) {
            return new ArrayList<>();
        }
        List<Integer> aisles = new ArrayList<>();
        for (String s : aisleAfter.split(",")) {
            try {
                aisles.add(Integer.parseInt(s.trim()));
            } catch (NumberFormatException e) {
                // Skip invalid entries
            }
        }
        return aisles;
    }
}
