-- Migration script to add username field to existing tables
USE eventvenue_db;

-- Add username column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE AFTER password,
ADD INDEX IF NOT EXISTS idx_username (username);

-- Add username column to vendors table if it doesn't exist
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE AFTER password,
ADD INDEX IF NOT EXISTS idx_username (username);
