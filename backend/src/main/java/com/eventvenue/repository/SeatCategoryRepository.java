package com.eventvenue.repository;

import com.eventvenue.entity.SeatCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SeatCategoryRepository extends JpaRepository<SeatCategory, Long> {
    List<SeatCategory> findByEventIdOrderBySortOrderAsc(Long eventId);
    
    @Modifying
    @Transactional
    void deleteByEventId(Long eventId);
}

