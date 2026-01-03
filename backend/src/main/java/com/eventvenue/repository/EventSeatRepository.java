package com.eventvenue.repository;

import com.eventvenue.entity.EventSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventSeatRepository extends JpaRepository<EventSeat, Long> {
    List<EventSeat> findByEventIdOrderByRowLabelAscSeatNumberAsc(Long eventId);
    
    List<EventSeat> findByEventIdAndStatus(Long eventId, String status);
    
    Optional<EventSeat> findByEventIdAndRowLabelAndSeatNumber(Long eventId, String rowLabel, Integer seatNumber);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM EventSeat s WHERE s.id IN :ids AND s.status = :status")
    List<EventSeat> findByIdInAndStatusWithLock(@Param("ids") List<Long> ids, @Param("status") String status);
    
    List<EventSeat> findByBookingId(Long bookingId);
    
    @Modifying
    @Transactional
    void deleteByEventId(Long eventId);
    
    long countByEventIdAndStatus(Long eventId, String status);
}

