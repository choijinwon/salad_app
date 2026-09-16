package com.saladapp.auth.dto;

import com.saladapp.common.enums.UserRole;
import com.saladapp.customer.Profile;

import java.util.UUID;

public record AuthSessionResponse(
        UUID id,
        UserRole role,
        String name,
        String phone,
        String address,
        String email,
        String uniqueCode
) {
    public static AuthSessionResponse from(Profile profile) {
        return new AuthSessionResponse(
                profile.getId(),
                profile.getRole(),
                profile.getName(),
                profile.getPhone(),
                profile.getAddress(),
                profile.getEmail(),
                profile.getUniqueCode()
        );
    }
}
