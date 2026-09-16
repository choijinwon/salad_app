package com.saladapp.customer.dto;

import com.saladapp.common.enums.OrderSource;
import com.saladapp.common.enums.SubscriptionStatus;
import com.saladapp.customer.Subscription;

import java.time.LocalDate;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        UUID customerId,
        OrderSource orderSource,
        int totalCount,
        int remainingCount,
        int unitPrice,
        SubscriptionStatus status,
        LocalDate startDate,
        LocalDate endDate
) {
    public static SubscriptionResponse from(Subscription subscription) {
        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getCustomerId(),
                subscription.getOrderSource(),
                subscription.getTotalCount(),
                subscription.getRemainingCount(),
                subscription.getUnitPrice(),
                subscription.getStatus(),
                subscription.getStartDate(),
                subscription.getEndDate()
        );
    }
}
