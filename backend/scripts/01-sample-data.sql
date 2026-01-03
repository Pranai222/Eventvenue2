-- Sample Data for EventVenue Platform
-- Insert test data for development and testing

USE eventvenue_db;

-- Insert test users
INSERT INTO users (email, password, first_name, last_name, role, points, is_active, is_verified) VALUES
('admin@eventvenue.com', '$2a$10$1oQq9W2Kq1W9W2Kq1W9W2.uVkQ1oQq9W2Kq1W9W2Kq1W9W2', 'Admin', 'User', 'ADMIN', 0, true, true),
('user1@eventvenue.com', '$2a$10$1oQq9W2Kq1W9W2Kq1W9W2.uVkQ1oQq9W2Kq1W9W2Kq1W9W2', 'John', 'Doe', 'USER', 2000, true, false),
('user2@eventvenue.com', '$2a$10$1oQq9W2Kq1W9W2Kq1W9W2.uVkQ1oQq9W2Kq1W9W2Kq1W9W2', 'Jane', 'Smith', 'USER', 2000, true, false),
('vendor1@eventvenue.com', '$2a$10$1oQq9W2Kq1W9W2Kq1W9W2.uVkQ1oQq9W2Kq1W9W2Kq1W9W2', 'Rajesh', 'Kumar', 'VENDOR', 0, true, false),
('vendor2@eventvenue.com', '$2a$10$1oQq9W2Kq1W9W2Kq1W9W2.uVkQ1oQq9W2Kq1W9W2Kq1W9W2', 'Priya', 'Singh', 'VENDOR', 0, true, false);

-- Insert admin user record
INSERT INTO admin_users (user_id, role, permissions) VALUES
(1, 'ADMIN', 'ALL');

-- Insert vendors
INSERT INTO vendors (user_id, business_name, business_description, business_address, business_phone, status, is_active) VALUES
(4, 'Grand Banquet Hall', 'Premium venue for weddings and corporate events', '123 Main St, Delhi, India', '+91-9876543210', 'APPROVED', true),
(5, 'Event Pro Services', 'Professional event management and venue rentals', '456 Park Ave, Mumbai, India', '+91-9876543211', 'APPROVED', true);

-- Insert venues
INSERT INTO venues (vendor_id, name, description, location, city, state, postal_code, capacity, price_per_hour, amenities, is_active, approval_status) VALUES
(1, 'Grand Ballroom', 'Spacious hall with modern amenities', '123 Main St, Delhi', 'Delhi', 'Delhi', '110001', 500, 5000.00, 'AC, WiFi, Parking, Catering', true, 'APPROVED'),
(1, 'Garden Pavilion', 'Open-air venue with beautiful gardens', '123 Main St, Delhi', 'Delhi', 'Delhi', '110001', 300, 3000.00, 'WiFi, Parking, Open Bar', true, 'APPROVED'),
(2, 'Mumbai Event Center', 'Modern event space with multiple halls', '456 Park Ave, Mumbai', 'Mumbai', 'Maharashtra', '400001', 1000, 8000.00, 'AC, WiFi, Parking, Security', true, 'APPROVED'),
(2, 'Rooftop Lounge', 'Premium rooftop venue with city views', '456 Park Ave, Mumbai', 'Mumbai', 'Maharashtra', '400001', 200, 6000.00, 'AC, WiFi, Parking, Bar', true, 'APPROVED');

-- Insert events
INSERT INTO events (vendor_id, name, description, event_date, event_time, location, category, total_tickets, available_tickets, price_per_ticket, is_active, approval_status) VALUES
(1, 'Annual Tech Summit 2025', 'Annual technology conference with industry leaders', '2025-02-15', '09:00:00', 'Delhi', 'Conference', 500, 450, 999.00, true, 'APPROVED'),
(1, 'Live Music Concert', 'International artists performing live', '2025-03-01', '19:00:00', 'Delhi', 'Concert', 1000, 800, 1499.00, true, 'APPROVED'),
(2, 'Product Launch Event', 'Brand new product launch with media coverage', '2025-02-28', '10:00:00', 'Mumbai', 'Corporate', 300, 250, 499.00, true, 'APPROVED'),
(2, 'Bollywood Night Gala', 'Celebrity performances and entertainment', '2025-03-15', '20:00:00', 'Mumbai', 'Entertainment', 800, 600, 2999.00, true, 'APPROVED');

-- Insert products
INSERT INTO products (vendor_id, name, description, category, price, quantity_available, is_active) VALUES
(1, 'VIP Pass Add-on', 'Upgrade to VIP with exclusive access', 'Pass', 500.00, 100, true),
(1, 'Merchandise Bundle', 'Official event merchandise pack', 'Merchandise', 1500.00, 50, true),
(2, 'Premium Seating', 'Priority seating upgrade', 'Seat', 2000.00, 30, true),
(2, 'Catering Package', 'Full meal service for one person', 'Food', 800.00, 200, true);
