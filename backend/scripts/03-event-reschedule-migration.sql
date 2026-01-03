-- Migration: Add event reschedule and cancellation fields
-- Run this to add new columns for event reschedule/cancellation tracking

-- Add reschedule tracking columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS reschedule_count INT DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS was_rescheduled BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS last_rescheduled_at TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;

-- Add original values for reference
ALTER TABLE events ADD COLUMN IF NOT EXISTS original_event_date DATETIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS original_location VARCHAR(255);

-- Add cancellation tracking columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Update existing events to set original values
UPDATE events SET original_event_date = event_date WHERE original_event_date IS NULL;
UPDATE events SET original_location = location WHERE original_location IS NULL;

-- Add index for cancelled events
CREATE INDEX IF NOT EXISTS idx_is_cancelled ON events (is_cancelled);
CREATE INDEX IF NOT EXISTS idx_was_rescheduled ON events (was_rescheduled);
