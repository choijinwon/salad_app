package com.saladapp.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerLoginRequest(
        @NotBlank String loginId,
        @NotBlank String password
) {
}
