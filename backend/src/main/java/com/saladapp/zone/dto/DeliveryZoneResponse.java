package com.saladapp.zone.dto;

import com.saladapp.zone.DeliveryZone;

import java.util.UUID;
import java.util.List;

public record DeliveryZoneResponse(
        UUID id,
        String zoneName,
        String description,
        List<List<Double>> boundary,
        String color
) {
    public static DeliveryZoneResponse from(DeliveryZone zone) {
        return new DeliveryZoneResponse(zone.getId(), zone.getZoneName(), zone.getDescription(), zone.getBoundary(), zone.getColor());
    }
}
