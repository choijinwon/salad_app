package com.saladapp.zone.dto;

import com.saladapp.zone.DeliveryZone;

import java.util.UUID;

public record DeliveryZoneResponse(
        UUID id,
        String zoneName,
        String description
) {
    public static DeliveryZoneResponse from(DeliveryZone zone) {
        return new DeliveryZoneResponse(zone.getId(), zone.getZoneName(), zone.getDescription());
    }
}
