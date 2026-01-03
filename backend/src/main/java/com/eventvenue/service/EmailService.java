package com.eventvenue.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.name}")
    private String appName;

    @Value("${app.email}")
    private String fromEmail;

    @Value("${app.url}")
    private String appUrl;

    /**
     * Send OTP verification email with welcome message
     */
    @Async
    public void sendOtpEmail(String toEmail, String otp, String role) {
        try {
            String subject = "Welcome to " + appName + " - Verify Your Email";
            String htmlContent = buildOtpEmailTemplate(toEmail, otp, role);
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            // Fallback to console for development
            System.out.println("========================================");
            System.out.println("EMAIL NOT CONFIGURED - OTP CODE");
            System.out.println("To: " + toEmail);
            System.out.println("OTP: " + otp);
            System.out.println("========================================");
        }
    }

    // Backward compatibility
    public void sendOtpEmail(String email, String otp) {
        sendOtpEmail(email, otp, "USER");
    }

    /**
     * Build professional OTP email HTML template
     */
    private String buildOtpEmailTemplate(String email, String otp, String role) {
        String roleDisplay = role.equals("VENDOR") ? "Vendor" : "Member";
        
        return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .welcome-text { color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
        .otp-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; text-align: center; }
        .otp-label { color: #666; font-size: 14px; margin-bottom: 10px; }
        .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace; }
        .expiry { color: #999; font-size: 12px; margin-top: 10px; }
        .info-box { background: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-box h3 { color: #1976d2; margin-top: 0; }
        .info-box p { color: #555; margin: 10px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .footer a { color: #667eea; text-decoration: none; }
        .divider { height: 1px; background: #e0e0e0; margin: 30px 0; }
        .highlight { color: #667eea; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to %s!</h1>
        </div>
        
        <div class="content">
            <p class="welcome-text">
                Hello and welcome! 👋
            </p>
            
            <p class="welcome-text">
                Thank you for registering with <strong>%s</strong>! We're excited to have you with us 
                and can't wait for you to explore amazing events and venues. Your journey to unforgettable 
                experiences starts here! 🌟
            </p>
            
            <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">%s</div>
                <div class="expiry">⏱️ Valid for 10 minutes</div>
            </div>
            
            <p class="welcome-text">
                Enter this code on the verification page to complete your registration and unlock:
            </p>
            
            <div class="info-box">
                <h3>✨ What's waiting for you:</h3>
                <p>📅 <strong>Browse Events:</strong> Discover exciting events happening near you</p>
                <p>🏢 <strong>Book Venues:</strong> Find and reserve the perfect venue for your needs</p>
                <p>🎁 <strong>Earn Points:</strong> Get rewards with every booking</p>
                <p>💳 <strong>Secure Payments:</strong> Safe and easy checkout process</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #999; font-size: 13px;">
                <strong>🔒 Security Note:</strong> If you didn't request this code, please ignore this email. 
                Your account is safe and no action is needed.
            </p>
            
            <p style="color: #999; font-size: 13px; margin-top: 20px;">
                Need help? Contact us at <a href="mailto:support@eventvenue.com">support@eventvenue.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 %s. All rights reserved.</p>
            <p>
                <a href="%s">Visit Website</a> | 
                <a href="%s/about">About Us</a> | 
                <a href="%s/contact">Contact</a>
            </p>
        </div>
    </div>
</body>
</html>
""".formatted(appName, appName, otp, appName, appUrl, appUrl, appUrl);
    }

    /**
     * Send HTML email
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = HTML
        
        mailSender.send(message);
    }

    // Keep existing methods for compatibility
    /**
     * Send event booking confirmation email
     */
    @Async
    public void sendEventBookingConfirmation(
            String toEmail, 
            String userName,
            Long bookingId,
            String eventName,
            String eventDate,
            String eventTime,
            String location,
            int quantity,
            double totalAmount,
            int pointsEarned
    ) {
        try {
            String subject = "Booking Confirmed - " + eventName;
            String htmlContent = buildEventBookingTemplate(
                userName, bookingId, eventName, eventDate, eventTime, 
                location, quantity, totalAmount, pointsEarned
            );
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("Event booking confirmation sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send booking confirmation to: {}", toEmail, e);
        }
    }

    /**
     * Send venue booking confirmation email
     */
    @Async
    public void sendVenueBookingConfirmation(
            String toEmail,
            String userName,
            Long bookingId,
            String venueName,
            String bookingDate,
            String location,
            int capacity,
            double totalAmount,
            int pointsEarned
    ) {
        try {
            String subject = "Venue Reservation Confirmed - " + venueName;
            String htmlContent = buildVenueBookingTemplate(
                userName, bookingId, venueName, bookingDate, 
                location, capacity, totalAmount, pointsEarned
            );
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("Venue booking confirmation sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send venue booking confirmation to: {}", toEmail, e);
        }
    }

    /**
     * Send points notification email
     */
    @Async
    public void sendPointsNotification(
            String toEmail,
            String userName,
            int points,
            String action,
            String description,
            int newBalance
    ) {
        try {
            String subject = "Points " + action + " - " + Math.abs(points) + " Points";
            String htmlContent = buildPointsNotificationTemplate(
                userName, points, action, description, newBalance
            );
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("Points notification sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send points notification to: {}", toEmail, e);
        }
    }

    /**
     * Build event booking confirmation template
     */
    private String buildEventBookingTemplate(
            String userName, Long bookingId, String eventName, 
            String eventDate, String eventTime, String location,
            int quantity, double totalAmount, int pointsEarned
    ) {
        return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .success-badge { background: #ffffff; color: #10b981; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .booking-box { background: #f8fafb; border-radius: 12px; padding: 25px; margin: 20px 0; border: 2px solid #e5e7eb; }
        .booking-id { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
        .event-name { font-size: 24px; font-weight: bold; color: #1f2937; margin: 10px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { color: #6b7280; font-weight: 500; }
        .detail-value { color: #1f2937; font-weight: 600; }
        .total-box { background: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .total-amount { font-size: 32px; font-weight: bold; }
        .points-badge { background: #fbbf24; color: #78350f; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .button { background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <div class="success-badge">✓ Successfully Booked</div>
        </div>
        
        <div class="content">
            <p style="font-size: 16px; color: #333;">Hi %s,</p>
            
            <p style="font-size: 16px; color: #333;">
                Great news! Your booking has been confirmed. Get ready for an amazing experience!
            </p>
            
            <div class="booking-box">
                <div class="booking-id">Booking ID: #%d</div>
                <div class="event-name">%s</div>
                
                <div style="margin-top: 20px;">
                    <div class="detail-row">
                        <span class="detail-label">📅 Date</span>
                        <span class="detail-value">%s</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">🕐 Time</span>
                        <span class="detail-value">%s</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">📍 Location</span>
                        <span class="detail-value">%s</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">🎫 Tickets</span>
                        <span class="detail-value">%d</span>
                    </div>
                </div>
            </div>
            
            <div class="total-box">
                <div style="font-size: 14px; margin-bottom: 5px;">Total Amount Paid</div>
                <div class="total-amount">₹%.2f</div>
                <div class="points-badge">🎁 +%d Points Earned!</div>
            </div>
            
            <p style="color: #333; font-size: 14px;">
                <strong>What's Next?</strong><br>
                • Save this confirmation email<br>
                • Arrive 15 minutes before the event<br>
                • Bring a valid ID<br>
                • Show this email at the venue
            </p>
            
            <div style="text-align: center;">
                <a href="%s/user/bookings" class="button">View My Bookings</a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Need help? Contact us at <a href="mailto:support@eventvenue.com">support@eventvenue.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 %s. All rights reserved.</p>
            <p>This is an automated confirmation email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
""".formatted(userName, bookingId, eventName, eventDate, eventTime, location, 
              quantity, totalAmount, pointsEarned, appUrl, appName);
    }

    /**
     * Build venue booking confirmation template
     */
    private String buildVenueBookingTemplate(
            String userName, Long bookingId, String venueName,
            String bookingDate, String location, int capacity,
            double totalAmount, int pointsEarned
    ) {
        return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #3b82f6 0%%, #1d4ed8 100%%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .success-badge { background: #ffffff; color: #3b82f6; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; }       
        .content { padding: 40px 30px; }
        .venue-box { background: #f8fafb; border-radius: 12px; padding: 25px; margin: 20px 0; border: 2px solid #e5e7eb; }
        .venue-name { font-size: 24px; font-weight: bold; color: #1f2937; margin: 10px 0; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { color: #6b7280; font-weight: 500; display: block; margin-bottom: 5px; }
        .detail-value { color: #1f2937; font-weight: 600; }
        .total-box { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .total-amount { font-size: 32px; font-weight: bold; }
        .points-badge { background: #fbbf24; color: #78350f; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Venue Reserved!</h1>
            <div class="success-badge">✓ Reservation Confirmed</div>
        </div>
        
        <div class="content">
            <p style="font-size: 16px; color: #333;">Hi %s,</p>
            
            <p style="font-size: 16px; color: #333;">
                Your venue has been successfully reserved! We look forward to hosting your event.
            </p>
            
            <div class="venue-box">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Booking ID: #%d</div>
                <div class="venue-name">%s</div>
                
                <div style="margin-top: 20px;">
                    <div class="detail-row">
                        <span class="detail-label">📅 Booking Date</span>
                        <span class="detail-value">%s</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">📍 Location</span>
                        <span class="detail-value">%s</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">👥 Capacity</span>
                        <span class="detail-value">Up to %d people</span>
                    </div>
                </div>
            </div>
            
            <div class="total-box">
                <div style="font-size: 14px; margin-bottom: 5px;">Total Amount Paid</div>
                <div class="total-amount">₹%.2f</div>
                <div class="points-badge">🎁 +%d Points Earned!</div>
            </div>
            
            <p style="color: #333; font-size: 14px;">
                <strong>Important Information:</strong><br>
                • Venue access will be provided 1 hour before your booking time<br>
                • Please bring this confirmation and valid ID<br>
                • Contact venue staff for setup assistance<br>
                • Review venue rules and regulations
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Questions? Reach out to us at <a href="mailto:support@eventvenue.com">support@eventvenue.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 %s. All rights reserved.</p>
            <p>This is an automated confirmation email.</p>
        </div>
    </div>
</body>
</html>
""".formatted(userName, bookingId, venueName, bookingDate, location, capacity, totalAmount, pointsEarned, appName);
    }

    /**
     * Build points notification template
     */
    private String buildPointsNotificationTemplate(
            String userName, int points, String action,
            String description, int newBalance
    ) {
        boolean isEarned = points > 0;
        String color = isEarned ? "#10b981" : "#ef4444";
        String icon = isEarned ? "🎁" : "💳";
        String actionText = isEarned ? "Earned" : "Redeemed";
        
        return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: %s; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .points-box { background: #f8fafb; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; border: 3px dashed %s; }
        .points-amount { font-size: 48px; font-weight: bold; color: %s; }
        .balance-box { background: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .balance-row { display: flex; justify-content: space-between; padding: 10px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .button { background: %s; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>%s Points %s!</h1>
        </div>
        
        <div class="content">
            <p style="font-size: 16px; color: #333;">Hi %s,</p>
            
            <div class="points-box">
                <div style="font-size: 18px; color: #6b7280; margin-bottom: 10px;">%s</div>
                <div class="points-amount">%+d</div>
                <div style="font-size: 16px; color: #6b7280; margin-top: 10px;">%s</div>
            </div>
            
            <div class="balance-box">
                <div class="balance-row">
                    <span style="font-weight: 600; color: #1f2937;">Transaction:</span>
                    <span style="color: #6b7280;">%s</span>
                </div>
                <div class="balance-row" style="border-top: 2px solid #d1d5db; margin-top: 10px; padding-top: 10px;">
                    <span style="font-weight: bold; color: #1f2937; font-size: 18px;">New Balance:</span>
                    <span style="font-weight: bold; color: %s; font-size: 18px;">%d Points</span>
                </div>
            </div>
            
            <p style="color: #333; font-size: 14px;">
                %s
            </p>
            
            <div style="text-align: center;">
                <a href="%s/user/profile" class="button">View Points History</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 %s. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
""".formatted(
    color, color, color, color, icon, actionText, userName,
    actionText, points, description, description, color, newBalance,
    isEarned ? "Keep earning points with every booking! Redeem them for discounts on your next reservation." 
             : "Thank you for using your points! Continue earning more with every booking.",
    appUrl, appName
);
    }

    // Keep existing compatibility methods
    public void sendBookingConfirmation(String email, String bookingDetails) {
        log.info("Legacy booking confirmation call for: {}", email);
    }

    public void sendBookingCancellation(String email, String bookingDetails) {
        log.info("Booking cancellation email placeholder for: {}", email);
    }

    public void sendVendorApproval(String email, String vendorName) {
        log.info("Vendor approval email placeholder for: {}", email);
    }

    public void sendVendorRejection(String email, String vendorName, String reason) {
        log.info("Vendor rejection email placeholder for: {}", email);
    }
    
    /**
     * Send event reschedule notification to booked users
     */
    @Async
    public void sendEventRescheduleNotification(
            String toEmail,
            String userName,
            String eventName,
            String oldDate,
            String oldTime,
            String oldLocation,
            String newDate,
            String newTime,
            String newLocation,
            String reason
    ) {
        try {
            String subject = "⚠️ Event Rescheduled - " + eventName;
            String htmlContent = buildEventRescheduleTemplate(
                userName, eventName, oldDate, oldTime, oldLocation,
                newDate, newTime, newLocation, reason
            );
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("Event reschedule notification sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reschedule notification to: {}", toEmail, e);
            System.out.println("[EMAIL] Reschedule notification - User: " + userName + 
                ", Event: " + eventName + ", New Date: " + newDate + ", Reason: " + reason);
        }
    }
    
    /**
     * Send event cancellation notification to booked users
     */
    @Async
    public void sendEventCancellationNotification(
            String toEmail,
            String userName,
            String eventName,
            String reason,
            int pointsRefunded
    ) {
        try {
            String subject = "❌ Event Cancelled - " + eventName;
            String htmlContent = buildEventCancellationTemplate(
                userName, eventName, reason, pointsRefunded
            );
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            log.info("Event cancellation notification sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send cancellation notification to: {}", toEmail, e);
            System.out.println("[EMAIL] Cancellation notification - User: " + userName + 
                ", Event: " + eventName + ", Points Refunded: " + pointsRefunded);
        }
    }
    
    /**
     * Build event reschedule notification template
     */
    private String buildEventRescheduleTemplate(
            String userName, String eventName,
            String oldDate, String oldTime, String oldLocation,
            String newDate, String newTime, String newLocation,
            String reason
    ) {
        return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .warning-badge { background: #ffffff; color: #d97706; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .event-name { font-size: 24px; font-weight: bold; color: #1f2937; margin: 20px 0; }
        .changes-box { background: #fef3c7; border-radius: 12px; padding: 25px; margin: 20px 0; border: 2px solid #f59e0b; }
        .change-section { margin: 15px 0; }
        .change-label { font-weight: bold; color: #92400e; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .old-value { color: #6b7280; text-decoration: line-through; }
        .new-value { color: #059669; font-weight: bold; font-size: 18px; }
        .reason-box { background: #f3f4f6; border-left: 4px solid #d97706; padding: 15px 20px; margin: 20px 0; }
        .reason-label { font-weight: bold; color: #1f2937; margin-bottom: 5px; }
        .reason-text { color: #4b5563; }
        .action-box { background: #e0f2fe; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .action-text { color: #0369a1; font-weight: 600; margin-bottom: 10px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .button { background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 10px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Event Rescheduled</h1>
            <div class="warning-badge">⚠️ Important Update</div>
        </div>
        
        <div class="content">
            <p style="font-size: 16px; color: #333;">Hi %s,</p>
            
            <p style="font-size: 16px; color: #333;">
                We're writing to inform you that an event you've booked has been rescheduled.
            </p>
            
            <div class="event-name">%s</div>
            
            <div class="changes-box">
                <div class="change-section">
                    <div class="change-label">📅 Date Changed</div>
                    <div><span class="old-value">%s</span> → <span class="new-value">%s</span></div>
                </div>
                <div class="change-section">
                    <div class="change-label">🕐 Time Changed</div>
                    <div><span class="old-value">%s</span> → <span class="new-value">%s</span></div>
                </div>
                <div class="change-section">
                    <div class="change-label">📍 Location</div>
                    <div><span class="old-value">%s</span> → <span class="new-value">%s</span></div>
                </div>
            </div>
            
            <div class="reason-box">
                <div class="reason-label">Reason for Reschedule:</div>
                <div class="reason-text">%s</div>
            </div>
            
            <div class="action-box">
                <div class="action-text">🎫 Your ticket is still valid for the new date!</div>
                <p style="color: #0369a1; margin: 0;">If you cannot attend on the new date, you can cancel your booking and receive a <strong>95%% refund</strong>.</p>
                <a href="%s/user/bookings" class="button">Manage My Booking</a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Need help? Contact us at <a href="mailto:support@eventvenue.com">support@eventvenue.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 %s. All rights reserved.</p>
            <p>This is an automated notification email.</p>
        </div>
    </div>
</body>
</html>
""".formatted(userName, eventName, oldDate, newDate, oldTime, newTime, 
              oldLocation, newLocation, reason, appUrl, appName);
    }
    
    /**
     * Build event cancellation notification template
     */
    private String buildEventCancellationTemplate(
            String userName, String eventName, String reason, int pointsRefunded
    ) {
        return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #ef4444 0%%, #dc2626 100%%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .cancel-badge { background: #ffffff; color: #dc2626; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .event-name { font-size: 24px; font-weight: bold; color: #1f2937; margin: 20px 0; }
        .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 20px 0; }
        .refund-box { background: #dcfce7; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; border: 2px solid #22c55e; }
        .refund-label { color: #166534; font-weight: bold; margin-bottom: 10px; }
        .refund-amount { font-size: 36px; font-weight: bold; color: #22c55e; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .button { background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Event Cancelled</h1>
            <div class="cancel-badge">Booking Cancelled</div>
        </div>
        
        <div class="content">
            <p style="font-size: 16px; color: #333;">Hi %s,</p>
            
            <p style="font-size: 16px; color: #333;">
                We regret to inform you that the following event has been cancelled by the vendor:
            </p>
            
            <div class="event-name">%s</div>
            
            <div class="reason-box">
                <div style="font-weight: bold; color: #991b1b; margin-bottom: 5px;">Reason for Cancellation:</div>
                <div style="color: #7f1d1d;">%s</div>
            </div>
            
            <div class="refund-box">
                <div class="refund-label">🎁 Full Refund Processed</div>
                <div class="refund-amount">+%d Points</div>
                <p style="color: #166534; margin-top: 10px;">Your points have been fully refunded to your account.</p>
            </div>
            
            <p style="color: #333; font-size: 14px;">
                We apologize for any inconvenience this may have caused. Feel free to browse other amazing events on our platform!
            </p>
            
            <div style="text-align: center;">
                <a href="%s/events" class="button">Browse Events</a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Need help? Contact us at <a href="mailto:support@eventvenue.com">support@eventvenue.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 %s. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
""".formatted(userName, eventName, reason, pointsRefunded, appUrl, appName);
    }
}

