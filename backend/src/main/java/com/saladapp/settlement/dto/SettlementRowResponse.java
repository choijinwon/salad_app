package com.saladapp.settlement.dto;

import com.saladapp.common.enums.DeliveryStatus;

import java.util.UUID;

public record SettlementRowResponse(
        UUID deliveryId,
        UUID customerId,
        UUID zoneId,
        DeliveryStatus status,
        boolean insulatedBagReturned,
        int deductedCount,
        int amount
) {
}
