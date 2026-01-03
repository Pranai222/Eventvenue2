-- MySQL Database Creation Script for EventVenue Platform
-- Run this first to create the database and user

DROP DATABASE IF EXISTS eventvenue_db;
CREATE DATABASE eventvenue_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database user (optional - adjust credentials as needed)
-- CREATE USER IF NOT EXISTS 'eventvenue'@'localhost' IDENTIFIED BY 'eventvenue@123';
-- GRANT ALL PRIVILEGES ON eventvenue_db.* TO 'eventvenue'@'localhost';
-- FLUSH PRIVILEGES;
