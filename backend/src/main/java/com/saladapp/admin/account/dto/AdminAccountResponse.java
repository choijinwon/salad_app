package com.saladapp.admin.account.dto;

import com.saladapp.customer.Profile;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminAccountResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String uniqueCode,
        OffsetDateTime createdAt
) {
    public static AdminAccountResponse from(Profile profile) {
        return new AdminAccountResponse(
                profile.getId(),
                profile.getName(),
                profile.getEmail(),
                profile.getPhone(),
                profile.getUniqueCode(),
                profile.getCreatedAt()
        );
    }
}
