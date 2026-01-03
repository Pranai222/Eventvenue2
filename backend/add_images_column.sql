-- Add images column to events table
-- Run this in MySQL to enable image uploads for events

ALTER TABLE events ADD COLUMN images TEXT NULL;

-- Verify the column was added
DESCRIBE events;
