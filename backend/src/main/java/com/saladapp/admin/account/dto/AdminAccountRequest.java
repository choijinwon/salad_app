package com.saladapp.admin.account.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminAccountRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String password,
        String phone
) {
}
