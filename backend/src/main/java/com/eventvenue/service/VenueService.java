package com.eventvenue.service;

import com.eventvenue.entity.Venue;
import com.eventvenue.entity.Vendor;
import com.eventvenue.repository.VenueRepository;
import com.eventvenue.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class VenueService {

    private static final Long VENUE_CREATION_PLATFORM_FEE = 10L;

    @Autowired
    private VenueRepository venueRepository;
    
    @Autowired
    private VendorRepository vendorRepository;

    /**
     * Create venue and deduct platform fee (10 points) from vendor
     */
    @Transactional
    public Venue createVenue(Venue venue) {
        // Deduct platform fee from vendor
        Optional<Vendor> vendorOpt = vendorRepository.findById(venue.getVendorId());
        if (vendorOpt.isPresent()) {
            Vendor vendor = vendorOpt.get();
            Long currentPoints = vendor.getPoints() != null ? vendor.getPoints() : 0L;
            
            if (currentPoints < VENUE_CREATION_PLATFORM_FEE) {
                throw new RuntimeException("Insufficient points. You need " + VENUE_CREATION_PLATFORM_FEE + 
                    " points to create a venue but have " + currentPoints);
            }
            
            vendor.setPoints(currentPoints - VENUE_CREATION_PLATFORM_FEE);
            vendorRepository.save(vendor);
            
            System.out.println("[PLATFORM FEE] Deducted " + VENUE_CREATION_PLATFORM_FEE + 
                " points from vendor " + vendor.getId() + " for venue creation");
        }
        
        return venueRepository.save(venue);
    }

    public Optional<Venue> getVenueById(Long id) {
        return venueRepository.findById(id);
    }

    public List<Venue> getVenuesByVendor(Long vendorId) {
        return venueRepository.findByVendorId(vendorId);
    }

    public List<Venue> getVenuesByCity(String city) {
        return venueRepository.findByCity(city);
    }

    public List<Venue> getAvailableVenues() {
        return venueRepository.findByIsAvailable(true);
    }

    public List<Venue> searchVenues(String query) {
        return venueRepository.search(query);
    }

    public List<Venue> filterVenues(String city, String category, BigDecimal minPrice, BigDecimal maxPrice, Integer capacity, Double rating) {
        return venueRepository.filter(city, category, minPrice, maxPrice, capacity, rating);
    }

    public List<Venue> getFeaturedVenues() {
        return venueRepository.findFeatured();
    }

    public Venue updateVenue(Long id, Venue venueDetails) {
        Optional<Venue> venueOptional = venueRepository.findById(id);
        if (venueOptional.isPresent()) {
            Venue venue = venueOptional.get();
            if (venueDetails.getName() != null) {
                venue.setName(venueDetails.getName());
            }
            if (venueDetails.getDescription() != null) {
                venue.setDescription(venueDetails.getDescription());
            }
            if (venueDetails.getCity() != null) {
                venue.setCity(venueDetails.getCity());
            }
            if (venueDetails.getAddress() != null) {
                venue.setAddress(venueDetails.getAddress());
            }
            if (venueDetails.getCapacity() != null) {
                venue.setCapacity(venueDetails.getCapacity());
            }
            if (venueDetails.getPricePerHour() != null) {
                venue.setPricePerHour(venueDetails.getPricePerHour());
            }
            if (venueDetails.getIsAvailable() != null) {
                venue.setIsAvailable(venueDetails.getIsAvailable());
            }
            return venueRepository.save(venue);
        }
        throw new RuntimeException("Venue not found");
    }

    public void deleteVenue(Long id) {
        venueRepository.deleteById(id);
    }

    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }
}

