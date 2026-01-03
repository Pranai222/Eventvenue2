-- Add missing columns to points_history table
USE eventvenue_db;

ALTER TABLE points_history ADD COLUMN previous_points BIGINT NULL;
ALTER TABLE points_history ADD COLUMN new_points BIGINT NULL;

-- Verify
DESCRIBE points_history;
