package com.eventvenue.dto;

import com.eventvenue.entity.User;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String businessName;
    private String businessDescription;
    private String phone;
    private String role;
}
