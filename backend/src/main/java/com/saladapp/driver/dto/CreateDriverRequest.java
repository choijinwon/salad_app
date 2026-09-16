package com.saladapp.driver.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreateDriverRequest(
        @NotBlank String name,
        @NotBlank String password,
        @NotBlank String phone,
        UUID zoneId,
        String vehicleNumber
) {
}
