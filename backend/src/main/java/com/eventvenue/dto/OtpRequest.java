package com.eventvenue.dto;

import lombok.Data;

@Data
public class OtpRequest {
    private String email;
    private String role; // USER or VENDOR
}
