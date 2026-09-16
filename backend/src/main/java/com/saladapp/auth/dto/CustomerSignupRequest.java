package com.saladapp.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerSignupRequest(
        @NotBlank String name,
        @NotBlank String phone,
        @NotBlank String address,
        @Email @NotBlank String email,
        @NotBlank String password
) {
}
