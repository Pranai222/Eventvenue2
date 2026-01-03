package com.eventvenue.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String role;
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Long points;
    private Boolean isVerified;
    private String businessName;
    private String businessDescription;
    private String message;
}
