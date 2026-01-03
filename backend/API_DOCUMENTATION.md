# EventVenue Backend API Documentation

## Base URL
\`\`\`
http://localhost:8080/api
\`\`\`

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <JWT_TOKEN>
\`\`\`

---

## Authentication Endpoints

### 1. User Signup
- **Endpoint:** `POST /auth/user/signup`
- **Description:** Register a new user account
- **Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "Password@123",
  "name": "John User"
}
\`\`\`
- **Response (201):**
\`\`\`json
{
  "success": true,
  "message": "User registered successfully. Please login with your email",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John User",
    "points": 2000,
    "role": "USER",
    "isVerified": false
  }
}
\`\`\`

### 2. User Login
- **Endpoint:** `POST /auth/user/login`
- **Description:** Authenticate user and get JWT token
- **Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "Password@123"
}
\`\`\`
- **Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "USER",
    "userId": 1,
    "email": "user@example.com",
    "name": "John User",
    "message": "Login successful"
  }
}
\`\`\`

### 3. Vendor Signup
- **Endpoint:** `POST /auth/vendor/signup`
- **Description:** Register a new vendor (pending admin approval)
- **Body:**
\`\`\`json
{
  "email": "vendor@example.com",
  "password": "Password@123",
  "businessName": "Premium Events LLC"
}
\`\`\`
- **Response (201):**
\`\`\`json
{
  "success": true,
  "message": "Vendor registered successfully. Pending admin approval",
  "data": {
    "id": 1,
    "email": "vendor@example.com",
    "businessName": "Premium Events LLC",
    "status": "PENDING",
    "isVerified": false
  }
}
\`\`\`

### 4. Vendor Login
- **Endpoint:** `POST /auth/vendor/login`
- **Description:** Authenticate vendor (must be APPROVED)
- **Body:**
\`\`\`json
{
  "email": "vendor@example.com",
  "password": "Password@123"
}
\`\`\`
- **Response (200) - Success:**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "VENDOR",
    "userId": 1,
    "email": "vendor@example.com",
    "businessName": "Premium Events LLC"
  }
}
\`\`\`
- **Response (403) - Pending Approval:**
\`\`\`json
{
  "success": false,
  "message": "Your vendor account is pending. Please wait for admin approval"
}
\`\`\`

### 5. Admin Login
- **Endpoint:** `POST /auth/admin/login`
- **Description:** Authenticate admin user
- **Body:**
\`\`\`json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
\`\`\`
- **Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "ADMIN",
    "userId": 1,
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
\`\`\`

### 6. Create First Admin (No Auth Required)
- **Endpoint:** `POST /auth/admin/create-admin`
- **Description:** Create the first admin account (only works if no admins exist)
- **Body:**
\`\`\`json
{
  "email": "admin@example.com",
  "password": "Admin@123",
  "name": "System Administrator"
}
\`\`\`
- **Response (201):**
\`\`\`json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "name": "System Administrator",
    "role": "ADMIN"
  }
}
\`\`\`

---

## Venue Endpoints

### 1. Create Venue (Vendor Only)
- **Endpoint:** `POST /venues`
- **Auth:** Required (Vendor)
- **Body:**
\`\`\`json
{
  "name": "Grand Ballroom",
  "description": "Spacious ballroom for large events",
  "category": "Wedding",
  "city": "Delhi",
  "address": "123 Main Street, Delhi",
  "capacity": 500,
  "pricePerHour": 50000.00,
  "amenities": "WiFi,Parking,AC,Kitchen,Sound System",
  "isAvailable": true
}
\`\`\`
- **Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Venue created successfully",
  "data": {
    "id": 1,
    "vendorId": 1,
    "name": "Grand Ballroom",
    "city": "Delhi",
    "capacity": 500,
    "pricePerHour": 50000.00,
    "isAvailable": true,
    "rating": 0.0,
    "totalBookings": 0
  }
}
\`\`\`

### 2. Get All Venues
- **Endpoint:** `GET /venues`
- **Auth:** Not Required
- **Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Venues retrieved successfully",
  "data": [
    {
      "id": 1,
      "vendorId": 1,
      "name": "Grand Ballroom",
      "city": "Delhi",
      "capacity": 500,
      "pricePerHour": 50000.00,
      "isAvailable": true,
      "rating": 4.5,
      "totalBookings": 12
    }
  ]
}
\`\`\`

### 3. Get Venue by ID
- **Endpoint:** `GET /venues/{id}`
- **Auth:** Not Required
- **Response (200):** Single venue object

### 4. Get Venues by City
- **Endpoint:** `GET /venues/city/{city}`
- **Auth:** Not Required
- **Example:** `GET /venues/city/Delhi`

### 5. Get My Venues (Vendor)
- **Endpoint:** `GET /venues/vendor/my-venues`
- **Auth:** Required (Vendor)
- **Response (200):** Array of vendor's venues

### 6. Update Venue
- **Endpoint:** `PUT /venues/{id}`
- **Auth:** Required (Vendor who owns the venue)
- **Body:** Same as Create Venue

### 7. Delete Venue
- **Endpoint:** `DELETE /venues/{id}`
- **Auth:** Required (Vendor who owns the venue)

---

## Booking Endpoints

### 1. Create Booking (User)
- **Endpoint:** `POST /bookings`
- **Auth:** Required (User)
- **Body:**
\`\`\`json
{
  "venueId": 1,
  "bookingDate": "2025-02-20",
  "checkInTime": "18:00:00",
  "checkOutTime": "23:00:00",
  "durationHours": 5,
  "totalAmount": 250000.00,
  "pointsUsed": 0
}
\`\`\`
- **Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "venueId": 1,
    "bookingDate": "2025-02-20",
    "totalAmount": 250000.00,
    "status": "PENDING",
    "paymentStatus": "PENDING"
  }
}
\`\`\`

### 2. Get My Bookings (User)
- **Endpoint:** `GET /bookings/user/my-bookings`
- **Auth:** Required (User)

### 3. Get Booking by ID
- **Endpoint:** `GET /bookings/{id}`
- **Auth:** Not Required

### 4. Get All Bookings (Admin)
- **Endpoint:** `GET /bookings`
- **Auth:** Required (Admin)

### 5. Update Booking Status (Admin)
- **Endpoint:** `PUT /bookings/{id}`
- **Auth:** Required (Admin)
- **Body:**
\`\`\`json
{
  "status": "CONFIRMED",
  "paymentStatus": "PAID"
}
\`\`\`

### 6. Cancel Booking
- **Endpoint:** `DELETE /bookings/{id}`
- **Auth:** Required (User who made the booking)

---

## Admin Endpoints

### 1. Get Pending Vendors
- **Endpoint:** `GET /admin/vendors/pending`
- **Auth:** Required (Admin)
- **Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Pending vendors retrieved successfully",
  "data": [
    {
      "id": 3,
      "email": "vendor@example.com",
      "businessName": "New Events",
      "status": "PENDING",
      "isVerified": false
    }
  ]
}
\`\`\`

### 2. Approve Vendor
- **Endpoint:** `PUT /admin/vendors/{vendorId}/approve`
- **Auth:** Required (Admin)
- **Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Vendor approved successfully",
  "data": {
    "id": 1,
    "businessName": "Premium Events",
    "status": "APPROVED",
    "isVerified": true
  }
}
\`\`\`

### 3. Reject Vendor
- **Endpoint:** `PUT /admin/vendors/{vendorId}/reject?reason=Incomplete_documentation`
- **Auth:** Required (Admin)
- **Query Parameters:**
  - `reason`: Reason for rejection
- **Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Vendor rejected successfully",
  "data": {
    "id": 1,
    "status": "REJECTED"
  }
}
\`\`\`

---

## User Endpoints

### 1. Get User Profile
- **Endpoint:** `GET /users/profile`
- **Auth:** Required (User)
- **Response (200):**
\`\`\`json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John User",
    "phone": "9876543210",
    "points": 2000,
    "isVerified": true,
    "role": "USER"
  }
}
\`\`\`

### 2. Update User Profile
- **Endpoint:** `PUT /users/{id}`
- **Auth:** Required (Own profile)
- **Body:**
\`\`\`json
{
  "name": "John User Updated",
  "phone": "9876543210"
}
\`\`\`

---

## Error Responses

### Standard Error Response
\`\`\`json
{
  "success": false,
  "message": "Error description",
  "data": null
}
\`\`\`

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Testing Workflow

### 1. Create First Admin (Postman)
\`\`\`
POST http://localhost:8080/api/auth/admin/create-admin
Body: {
  "email": "admin@eventvenue.com",
  "password": "Admin@123",
  "name": "System Admin"
}
\`\`\`

### 2. Admin Login
\`\`\`
POST http://localhost:8080/api/auth/admin/login
Body: {
  "email": "admin@eventvenue.com",
  "password": "Admin@123"
}
\`\`\`
Save the token to use for admin operations.

### 3. User Signup
\`\`\`
POST http://localhost:8080/api/auth/user/signup
Body: {
  "email": "user@example.com",
  "password": "Password@123",
  "name": "Test User"
}
\`\`\`

### 4. User Login
\`\`\`
POST http://localhost:8080/api/auth/user/login
Body: {
  "email": "user@example.com",
  "password": "Password@123"
}
\`\`\`

### 5. Vendor Signup
\`\`\`
POST http://localhost:8080/api/auth/vendor/signup
Body: {
  "email": "vendor@example.com",
  "password": "Password@123",
  "businessName": "Premium Events"
}
\`\`\`

### 6. Vendor Login (Will fail - pending approval)
\`\`\`
POST http://localhost:8080/api/auth/vendor/login
Body: {
  "email": "vendor@example.com",
  "password": "Password@123"
}
\`\`\`
Expected: 403 - Pending approval

### 7. Admin Approves Vendor
\`\`\`
PUT http://localhost:8080/api/admin/vendors/1/approve
Headers: Authorization: Bearer <ADMIN_TOKEN>
\`\`\`

### 8. Vendor Login (Now succeeds)
\`\`\`
POST http://localhost:8080/api/auth/vendor/login
Body: {
  "email": "vendor@example.com",
  "password": "Password@123"
}
\`\`\`

### 9. Vendor Creates Venue
\`\`\`
POST http://localhost:8080/api/venues
Headers: Authorization: Bearer <VENDOR_TOKEN>
Body: {
  "name": "Grand Ballroom",
  "description": "Spacious venue",
  "category": "Wedding",
  "city": "Delhi",
  "address": "123 Main Street",
  "capacity": 500,
  "pricePerHour": 50000,
  "amenities": "WiFi,Parking,AC"
}
\`\`\`

### 10. User Creates Booking
\`\`\`
POST http://localhost:8080/api/bookings
Headers: Authorization: Bearer <USER_TOKEN>
Body: {
  "venueId": 1,
  "bookingDate": "2025-02-20",
  "checkInTime": "18:00:00",
  "checkOutTime": "23:00:00",
  "durationHours": 5,
  "totalAmount": 250000,
  "pointsUsed": 0
}
\`\`\`

---

## Security Best Practices

1. **JWT Token Expiration**: Tokens expire after 24 hours
2. **Password Hashing**: All passwords are BCrypt hashed
3. **CORS**: Enabled for localhost:3000 and localhost:8000
4. **SQL Injection**: Protected via parameterized queries
5. **Role-Based Access**: Endpoints validate user roles

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Verify MySQL is running and credentials are correct |
| JWT token invalid | Ensure token format is "Bearer <token>" and token hasn't expired |
| Vendor can't login | Check vendor status is APPROVED in database |
| CORS error in browser | Verify frontend URL is in allowed CORS origins |
| Password authentication fails | Verify password hasn't been changed and try again |
