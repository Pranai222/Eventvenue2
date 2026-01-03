package com.eventvenue.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private String email;
    private String otp;
    private String role; // USER or VENDOR
}
