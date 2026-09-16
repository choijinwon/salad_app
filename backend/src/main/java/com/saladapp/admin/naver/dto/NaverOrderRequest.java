package com.saladapp.admin.naver.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record NaverOrderRequest(
        @NotBlank String naverOrderNo,
        @NotBlank String customerName,
        @NotBlank String phone,
        @NotBlank String address,
        String status,
        LocalDate deliveryDate
) {
}
