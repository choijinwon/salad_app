package com.saladapp.driver.dto;

import com.saladapp.customer.Profile;
import com.saladapp.driver.DriverProfile;

import java.util.UUID;

public record DriverResponse(
        UUID id,
        String name,
        String phone,
        UUID zoneId,
        String zoneName,
        String vehicleNumber,
        boolean isActive,
        String approvalStatus
) {
    public static DriverResponse from(DriverProfile driver, Profile profile, String zoneName) {
        return new DriverResponse(
                profile.getId(),
                profile.getName(),
                profile.getPhone(),
                driver.getZoneId(),
                zoneName,
                driver.getVehicleNumber(),
                driver.isActive(),
                driver.isActive() ? "APPROVED" : "PENDING"
        );
    }
}
