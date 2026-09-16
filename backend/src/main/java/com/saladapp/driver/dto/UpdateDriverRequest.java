package com.saladapp.driver.dto;

import java.util.UUID;

public record UpdateDriverRequest(
        String approvalStatus,
        Boolean isActive,
        String vehicleNumber,
        UUID zoneId
) {
}
