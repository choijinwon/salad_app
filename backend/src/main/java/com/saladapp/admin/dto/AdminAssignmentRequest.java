package com.saladapp.admin.dto;

import java.util.UUID;

public record AdminAssignmentRequest(
        UUID driverId,
        UUID zoneId,
        Integer routeOrder
) {
}
