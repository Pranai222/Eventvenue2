-- Initialize EventVenue Database with Sample Data and Admin Creation

USE eventvenue_db;

-- Insert first admin user (you can use this to login initially)
-- Email: admin@eventvenue.com, Password: Admin@123 (hashed: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeakeJQm7OFVFvBKePEKe)
INSERT IGNORE INTO admin_users (email, password, name, role, is_active, created_at, updated_at) 
VALUES (
    'admin@eventvenue.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeakeJQm7OFVFvBKePEKe',
    'System Admin',
    'ADMIN',
    TRUE,
    NOW(),
    NOW()
);

-- Sample Users
INSERT IGNORE INTO users (email, password, name, phone, points, is_verified, role, created_at, updated_at)
VALUES 
(
    'user1@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeakeJQm7OFVFvBKePEKe',
    'John User',
    '9876543210',
    2000,
    TRUE,
    'USER',
    NOW(),
    NOW()
),
(
    'user2@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeakeJQm7OFVFvBKePEKe',
    'Sarah Smith',
    '9876543211',
    2000,
    TRUE,
    'USER',
    NOW(),
    NOW()
);

-- Sample Approved Vendors
INSERT IGNORE INTO vendors (email, password, business_name, business_phone, business_address, city, state, pincode, description, status, is_verified, is_active, rating, total_venues, created_at, updated_at)
VALUES 
(
    'vendor1@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeakeJQm7OFVFvBKePEKe',
    'Premium Halls Delhi',
    '9876543212',
    '123 Main Street, Central Delhi',
    'Delhi',
    'Delhi',
    '110001',
    'Premium event venue with modern amenities',
    'APPROVED',
    TRUE,
    TRUE,
    4.5,
    3,
    NOW(),
    NOW()
),
(
    'vendor2@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeakeJQm7OFVFvBKePEKe',
    'Mumbai Event Spaces',
    '9876543213',
    '456 High Street, Mumbai',
    'Mumbai',
    'Maharashtra',
    '400001',
    'Modern wedding and conference halls',
    'APPROVED',
    TRUE,
    TRUE,
    4.8,
    5,
    NOW(),
    NOW()
);

-- Sample Pending Vendor
INSERT IGNORE INTO vendors (email, password, business_name, business_phone, business_address, city, state, pincode, description, status, is_verified, is_active, rating, total_venues, created_at, updated_at)
VALUES 
(
    'vendor3@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeakeJQm7OFVFvBKePEKe',
    'New Event Venues',
    '9876543214',
    '789 Park Lane, Bangalore',
    'Bangalore',
    'Karnataka',
    '560001',
    'Awaiting approval',
    'PENDING',
    FALSE,
    TRUE,
    0.0,
    0,
    NOW(),
    NOW()
);

-- Sample Venues (from vendor 1)
INSERT IGNORE INTO venues (vendor_id, name, description, category, city, address, capacity, price_per_hour, amenities, is_available, rating, total_bookings, created_at, updated_at)
VALUES 
(
    1,
    'Grand Ballroom',
    'Spacious ballroom perfect for large events',
    'Wedding',
    'Delhi',
    '123 Main Street',
    500,
    50000.00,
    'WiFi,Parking,AC,Kitchen,Sound System',
    TRUE,
    4.5,
    12,
    NOW(),
    NOW()
),
(
    1,
    'Conference Hall A',
    'Modern conference room with AV equipment',
    'Corporate',
    'Delhi',
    '123 Main Street',
    100,
    15000.00,
    'WiFi,Projector,AC,Sound System',
    TRUE,
    4.3,
    8,
    NOW(),
    NOW()
),
(
    2,
    'Marina Banquet',
    'Beachside wedding venue',
    'Wedding',
    'Mumbai',
    '456 High Street',
    300,
    40000.00,
    'WiFi,Parking,AC,Beach Access,Kitchen',
    TRUE,
    4.8,
    20,
    NOW(),
    NOW()
);

-- Sample Events (from vendor 1)
INSERT IGNORE INTO events (vendor_id, name, description, category, event_date, event_time, location, max_attendees, price_per_ticket, total_tickets, tickets_available, is_active, created_at, updated_at)
VALUES 
(
    1,
    'Annual Tech Summit 2025',
    'Leading technology conference featuring industry experts',
    'Corporate',
    '2025-03-15',
    '09:00:00',
    'Delhi Convention Center',
    1000,
    5000.00,
    500,
    450,
    TRUE,
    NOW(),
    NOW()
),
(
    2,
    'Annual Music Festival',
    'Three-day music festival with international artists',
    'Entertainment',
    '2025-04-10',
    '18:00:00',
    'Mumbai Amphitheater',
    5000,
    1500.00,
    3000,
    2500,
    TRUE,
    NOW(),
    NOW()
);

-- Sample Bookings
INSERT IGNORE INTO bookings (user_id, venue_id, booking_date, check_in_time, check_out_time, duration_hours, total_amount, points_used, status, payment_status, created_at, updated_at)
VALUES 
(
    1,
    1,
    '2025-02-15',
    '18:00:00',
    '23:00:00',
    5,
    250000.00,
    0,
    'CONFIRMED',
    'PAID',
    NOW(),
    NOW()
);

-- Sample Reviews
INSERT IGNORE INTO reviews (user_id, venue_id, rating, comment, created_at)
VALUES 
(
    1,
    1,
    5,
    'Excellent venue with perfect ambiance and great staff!',
    NOW()
),
(
    2,
    2,
    4,
    'Good venue but a bit expensive for the services',
    NOW()
);

-- Sample Points History
INSERT IGNORE INTO points_history (user_id, points_change, reason, previous_points, new_points, created_at)
VALUES 
(
    1,
    -100,
    'Booking cancellation',
    2000,
    1900,
    NOW()
);
