# EventVenue Backend - Complete Setup Guide

## Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+

## Step 1: Database Setup

### Create MySQL Database
\`\`\`sql
CREATE DATABASE IF NOT EXISTS eventvenue_db;
\`\`\`

### Create Database User
\`\`\`sql
CREATE USER 'eventvenue'@'localhost' IDENTIFIED BY 'eventvenue@123';
GRANT ALL PRIVILEGES ON eventvenue_db.* TO 'eventvenue'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

## Step 2: Update Configuration

Edit `src/main/resources/application.properties`:

\`\`\`properties
spring.datasource.url=jdbc:mysql://localhost:3306/eventvenue_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=eventvenue
spring.datasource.password=eventvenue@123
\`\`\`

## Step 3: Build the Project

\`\`\`bash
cd backend
mvn clean install
\`\`\`

## Step 4: Run the Application

\`\`\`bash
mvn spring-boot:run
\`\`\`

The backend will start on http://localhost:8080

## Step 5: Setup Initial Admin

Use Postman to create the first admin:

\`\`\`bash
POST http://localhost:8080/api/auth/admin/create-admin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin@123",
  "name": "Admin User"
}
\`\`\`

## Step 6: Test Vendor Approval Flow

1. **Create Vendor Account** (User can signup)
   - POST /api/auth/vendor/signup

2. **Vendor Login** - Will fail (status = PENDING)
   - Status message: "Your vendor account is pending. Please wait for admin approval"

3. **Admin Approves Vendor**
   - PUT /api/admin/vendors/{vendorId}/approve

4. **Now Vendor Can Login**
   - POST /api/auth/vendor/login - SUCCESS

## API Testing with Postman

1. Import `EventVenue-Postman-Collection.json`
2. Create environment variables for tokens
3. Test all endpoints

### Key Environment Variables

- `{{userToken}}` - User JWT token
- `{{vendorToken}}` - Vendor JWT token
- `{{adminToken}}` - Admin JWT token
- `{{userId}}` - User ID
- `{{vendorId}}` - Vendor ID
- `{{adminId}}` - Admin ID

## Test Scenarios

### Scenario 1: User Signup & Login
1. Create user account
2. Login with credentials
3. Verify token is generated
4. Check user points (2000 default)

### Scenario 2: Vendor Approval Workflow
1. Vendor signup
2. Vendor login fails (PENDING)
3. Admin approves vendor
4. Vendor login succeeds

### Scenario 3: Create Venue & Book

1. Vendor creates venue
2. User views all venues
3. User creates booking
4. Admin confirms booking
5. Payment status updated

## Database Schema

Tables created:
- users (role: USER, 2000 initial points)
- vendors (status: PENDING/APPROVED/REJECTED)
- admin_users (role: ADMIN)
- venues (managed by vendors)
- events (managed by vendors)
- bookings (created by users)
- reviews (ratings for venues/events)
- points_history (track point changes)
- otp_verifications (for email verification)

## JWT Token Format

Token includes:
- userId
- email
- role (USER, VENDOR, ADMIN)
- Expiration: 24 hours

## Error Handling

All endpoints return standardized response:
\`\`\`json
{
  "success": boolean,
  "message": string,
  "data": object
}
\`\`\`

## Security Features

- BCrypt password hashing
- JWT token-based authentication
- Role-based authorization
- CORS enabled for frontend
- SQL injection prevention with parameterized queries

## Troubleshooting

### Connection Error to Database
- Check MySQL is running
- Verify connection string in application.properties
- Ensure database user has correct permissions

### JWT Token Invalid
- Token expires after 24 hours
- Login again to get new token
- Check token format in Authorization header

### Vendor Cannot Login
- Check vendor status (must be APPROVED)
- Admin must approve vendor first
- Check if vendor record exists

### CORS Error in Frontend
- Check frontend URL is in allowed origins in SecurityConfig
- Verify Authorization header is included

## Next Steps

1. Update frontend API URL: `http://localhost:8080/api`
2. Configure authentication with JWT tokens
3. Test complete flow: signup → login → create venue → book
