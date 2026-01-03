package com.eventvenue.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String email, String role) {
        SecretKey key = getSigningKey();
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        String token = Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("email", email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
        
        System.out.println("[JWT Provider] ===== TOKEN GENERATION =====");
        System.out.println("[JWT Provider] User: " + email + ", Role: " + role + ", ID: " + userId);
        System.out.println("[JWT Provider] Issued: " + now);
        System.out.println("[JWT Provider] Expires: " + expiryDate);
        System.out.println("[JWT Provider] Token: " + token.substring(0, Math.min(50, token.length())) + "...");
        System.out.println("[JWT Provider] Token length: " + token.length());
        System.out.println("[JWT Provider] ===============================");
        
        return token;
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Integer) {
            return ((Integer) userIdObj).longValue();
        }
        return Long.parseLong(userIdObj.toString());
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return (String) claims.get("role");
    }

    public boolean validateToken(String token) {
        System.out.println("[JWT Provider] ===== TOKEN VALIDATION =====");
        System.out.println("[JWT Provider] Token to validate: " + token.substring(0, Math.min(50, token.length())) + "...");
        System.out.println("[JWT Provider] Token length: " + token.length());
        
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            System.out.println("[JWT Provider] ✓✓✓ TOKEN VALID ✓✓✓");
            System.out.println("[JWT Provider] Subject: " + claims.getSubject());
            System.out.println("[JWT Provider] User ID: " + claims.get("userId"));
            System.out.println("[JWT Provider] Role: " + claims.get("role"));
            System.out.println("[JWT Provider] Issued: " + claims.getIssuedAt());
            System.out.println("[JWT Provider] Expires: " + claims.getExpiration());
            System.out.println("[JWT Provider] ===============================");
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("[JWT Provider] ✗✗✗ Token EXPIRED ✗✗✗");
            System.out.println("[JWT Provider] Expiration date: " + e.getClaims().getExpiration());
            System.out.println("[JWT Provider] Current time: " + new Date());
        } catch (MalformedJwtException e) {
            System.out.println("[JWT Provider] ✗✗✗ Token MALFORMED ✗✗✗");
            System.out.println("[JWT Provider] Error: " + e.getMessage());
        } catch (io.jsonwebtoken.security.SignatureException e) {
            System.out.println("[JWT Provider] ✗✗✗ SIGNATURE VERIFICATION FAILED ✗✗✗");
            System.out.println("[JWT Provider] This means the token was signed with a different key!");
            System.out.println("[JWT Provider] Error: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.out.println("[JWT Provider] ✗✗✗ Token UNSUPPORTED ✗✗✗");
            System.out.println("[JWT Provider] Error: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("[JWT Provider] ✗✗✗ Token claims EMPTY or NULL ✗✗✗");
            System.out.println("[JWT Provider] Error: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("[JWT Provider] ✗✗✗ UNEXPECTED ERROR ✗✗✗");
            System.out.println("[JWT Provider] Error type: " + e.getClass().getName());
            System.out.println("[JWT Provider] Error message: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("[JWT Provider] ===============================");
        return false;
    }
}
