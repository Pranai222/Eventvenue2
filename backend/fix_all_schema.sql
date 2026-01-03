-- COMPLETE DATABASE SCHEMA FIX
-- Run this to sync database with Java entities

USE eventvenue_db;

-- ============================================
-- FIX 1: Add missing columns to bookings table
-- ============================================
ALTER TABLE bookings 
  ADD COLUMN quantity INT NULL COMMENT 'Number of tickets for event bookings';

ALTER TABLE bookings 
  ADD COLUMN start_date DATE NULL COMMENT 'Start date for multi-day venue bookings';

ALTER TABLE bookings 
  ADD COLUMN end_date DATE NULL COMMENT 'End date for multi-day venue bookings';

-- ============================================
-- FIX 2: Add missing columns to points_history table
-- ============================================
ALTER TABLE points_history 
  ADD COLUMN previous_points BIGINT NULL;

ALTER TABLE points_history 
  ADD COLUMN new_points BIGINT NULL;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Bookings table structure:' AS '';
DESCRIBE bookings;

SELECT '\nPoints History table structure:' AS '';
DESCRIBE points_history;

SELECT '\nAll fixes applied successfully!' AS '';
