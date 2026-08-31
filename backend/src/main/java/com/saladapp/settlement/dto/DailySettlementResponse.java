package com.saladapp.settlement.dto;

import java.time.LocalDate;
import java.util.List;

public record DailySettlementResponse(
        LocalDate settlementDate,
        int totalDeliveryCount,
        int completedDeliveryCount,
        int inTransitDeliveryCount,
        int bagReturnedCount,
        int unreturnedBagCount,
        int totalAmount,
        List<SettlementRowResponse> rows
) {
}
