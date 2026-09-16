package com.saladapp.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record DriverLoginRequest(
        @NotBlank String phone,
        @NotBlank String password
) {
}
