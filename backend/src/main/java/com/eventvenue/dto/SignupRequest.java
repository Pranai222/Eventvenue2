package com.eventvenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    
    private String businessName;
    private String businessDescription;
    private String businessPhone;
    private String businessAddress;
    private String city;
    private String state;
    private String pincode;
}
