# EventVenue Booking Platform - Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Spring Boot backend running on http://localhost:8080
- MySQL database configured

### Installation

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
\`\`\`

## Environment Configuration

### Required Backend API Endpoints

The frontend expects these endpoints to exist on your Spring Boot backend:

#### Authentication Endpoints
\`\`\`
POST /api/auth/user/login
POST /api/auth/user/signup
POST /api/auth/vendor/login
POST /api/auth/vendor/signup
POST /api/auth/admin/login
POST /api/auth/verify-otp
POST /api/auth/resend-otp
\`\`\`

#### Admin Endpoints
\`\`\`
GET /api/admin/users
POST /api/admin/users/{id}/delete
POST /api/admin/users/{id}/adjust-points
GET /api/admin/vendors
POST /api/admin/vendors/{id}/approve
POST /api/admin/vendors/{id}/reject
POST /api/admin/vendors/{id}/delete
\`\`\`

#### User Endpoints
\`\`\`
GET /api/users/profile
PUT /api/users/profile
GET /api/users/bookings
GET /api/bookings/{id}
POST /api/bookings/{id}/cancel
\`\`\`

#### Vendor Endpoints
\`\`\`
GET /api/vendors/profile
PUT /api/vendors/profile
GET /api/vendors/venues
POST /api/vendors/venues
DELETE /api/vendors/venues/{id}
GET /api/vendors/events
POST /api/vendors/events
DELETE /api/vendors/events/{id}
GET /api/vendors/bookings
\`\`\`

## Authentication Flow Diagram

\`\`\`
User                           Frontend                         Backend
 |                                |                               |
 |---Login form (email/pwd)------->|                              |
 |                                |---POST /api/auth/*/login----->|
 |                                |<---{token, user data}---------|
 |                                |                               |
 |                                |---Store token in localStorage |
 |                                |---Set auth context           |
 |<---Redirect to /*/dashboard----|                               |
 |                                |---GET /api/*/profile-------->|
 |                                |<---{profile data}-------------|
 |                                |                               |
\`\`\`

## File Structure Overview

\`\`\`
app/
├── layout.tsx                 # Root layout with AuthProvider
├── page.tsx                   # Home page
├── login/                     # Login routes
├── signup/                    # Signup routes
├── user/
│   ├── layout.tsx            # Protected user layout
│   ├── dashboard/
│   ├── bookings/
│   ├── profile/
│   └── points/
├── vendor/
│   ├── layout.tsx            # Protected vendor layout
│   ├── dashboard/
│   ├── venues/
│   ├── events/
│   ├── bookings/
│   ├── profile/
│   └── analytics/
└── admin/
    ├── layout.tsx            # Protected admin layout
    ├── dashboard/
    ├── users/
    ├── vendors/
    ├── bookings/
    └── settings/

lib/
├── api/
│   ├── client.ts            # HTTP client
│   ├── auth.ts              # Auth API methods
│   ├── users.ts             # User API methods
│   └── admin.ts             # Admin API methods
├── contexts/
│   └── auth-context.tsx     # Global auth state
├── types/
│   ├── auth.ts              # Auth types
│   └── booking.ts           # Booking types
└── utils/
    └── cn.ts                # CSS class utilities

components/
├── auth/
│   ├── login-form.tsx       # Reusable login form
│   ├── signup-form.tsx      # Signup form
│   └── otp-verification-form.tsx
├── layout/
│   ├── user-nav.tsx         # User navigation
│   ├── vendor-nav.tsx       # Vendor navigation
│   ├── admin-nav.tsx        # Admin navigation
│   └── footer.tsx
└── ui/                      # shadcn/ui components
\`\`\`

## Key Configuration Files

### lib/api/client.ts
- API base URL: `http://localhost:8080`
- Timeout: 10 seconds
- Public endpoints: Login, signup, OTP verification
- Authorized endpoints: Require Bearer token

### lib/contexts/auth-context.tsx
- Global authentication state
- Auto-redirects based on user role
- Stores token in localStorage
- Validates user on mount

### app/*/layout.tsx
- Protects routes by role
- Shows loading spinner during auth check
- Redirects unauthorized users to login

## Deployment Checklist

### Pre-Deployment
- [ ] Backend API is running and accessible
- [ ] Database schema is initialized
- [ ] All environment variables are set
- [ ] CORS is enabled on backend
- [ ] SSL/TLS certificates configured

### Frontend Deployment (Vercel)
\`\`\`bash
# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to Vercel
vercel deploy --prod
\`\`\`

### Environment Variables (Vercel)
\`\`\`
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
\`\`\`

### Post-Deployment
- [ ] Test all authentication flows
- [ ] Verify protected routes
- [ ] Check error handling
- [ ] Monitor API response times
- [ ] Review browser console for errors

## Troubleshooting

### Issue: "Unable to connect to server"
**Solution**: Ensure backend is running on http://localhost:8080
\`\`\`bash
# Check backend is running
curl http://localhost:8080/api/health
\`\`\`

### Issue: "Token invalid" after login
**Solution**: Clear localStorage and try again
\`\`\`javascript
// In browser console
localStorage.removeItem('auth_token')
localStorage.removeItem('auth_user')
\`\`\`

### Issue: Hydration mismatch errors
**Solution**: Ensure all dynamic content uses `useEffect` or conditional rendering
- Already fixed in this codebase

### Issue: CORS errors
**Solution**: Configure CORS on backend
\`\`\`java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "https://yourdomain.com")
            .allowedMethods("*")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
\`\`\`

## Security Best Practices

1. **Token Management**
   - Never expose token in URL
   - Store in secure httpOnly cookie (production)
   - Implement token refresh mechanism

2. **API Communication**
   - Always use HTTPS in production
   - Validate all user inputs
   - Implement rate limiting

3. **Protected Routes**
   - Verify role on backend
   - Don't rely solely on frontend role check
   - Implement proper authorization

4. **User Data**
   - Never log sensitive data
   - Implement proper error messages
   - Use encryption for passwords

## Performance Optimization

### Already Implemented
- Code splitting by route
- Dynamic imports for components
- Image optimization ready
- CSS minification
- API response caching with SWR

### Recommendations
- Implement database query optimization
- Add Redis caching layer
- Use CDN for static assets
- Implement API rate limiting
- Monitor performance metrics

## Support & Maintenance

### Common Issues
1. Auth token expiration
2. CORS configuration
3. Database connection timeouts
4. Memory leaks in components

### Monitoring Recommendations
- Set up error tracking (Sentry)
- Monitor API response times
- Track user authentication failures
- Set up uptime monitoring

### Regular Maintenance
- Update dependencies monthly
- Review error logs weekly
- Optimize slow API endpoints
- Update security patches immediately

---

**Last Updated**: 2025-12-25
**Version**: 1.0
**Status**: Production Ready 🚀
