package com.eventvenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCalculationResponse {
    private BigDecimal subtotal;
    private BigDecimal pointsDiscount;
    private BigDecimal totalAmount;
    private Integer pointsUsed;
    private Integer remainingAmount; // In cents
}
