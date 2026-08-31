package com.saladapp.delivery.dto;

import com.saladapp.common.enums.DeliveryStatus;
import com.saladapp.delivery.DeliverySchedule;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record DeliveryResponse(
        UUID id,
        UUID subscriptionId,
        UUID customerId,
        String customerName,
        UUID driverId,
        String driverName,
        UUID zoneId,
        String zoneName,
        LocalDate deliveryDate,
        DeliveryStatus status,
        Integer routeOrder,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        String requestNotes,
        boolean insulatedBagReturned,
        int unitPrice,
        OffsetDateTime completedAt
) {
    public static DeliveryResponse from(
            DeliverySchedule schedule,
            String customerName,
            String driverName,
            String zoneName,
            int unitPrice
    ) {
        return new DeliveryResponse(
                schedule.getId(),
                schedule.getSubscriptionId(),
                schedule.getCustomerId(),
                customerName,
                schedule.getDriverId(),
                driverName,
                schedule.getZoneId(),
                zoneName,
                schedule.getDeliveryDate(),
                schedule.getStatus(),
                schedule.getRouteOrder(),
                schedule.getAddress(),
                schedule.getLatitude(),
                schedule.getLongitude(),
                schedule.getDeliveryNotes(),
                schedule.isInsulatedBagReturned(),
                unitPrice,
                schedule.getCompletedAt()
        );
    }
}
