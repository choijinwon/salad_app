package com.saladapp.customer.dto;

import com.saladapp.common.enums.UserRole;
import com.saladapp.customer.Profile;

import java.time.LocalDate;
import java.util.UUID;

public record CustomerResponse(
        UUID id,
        UserRole role,
        String name,
        String phone,
        LocalDate birthdate,
        String address,
        UUID zoneId,
        String uniqueCode
) {
    public static CustomerResponse from(Profile profile) {
        return new CustomerResponse(
                profile.getId(),
                profile.getRole(),
                profile.getName(),
                profile.getPhone(),
                profile.getBirthdate(),
                profile.getAddress(),
                profile.getZoneId(),
                profile.getUniqueCode()
        );
    }
}
