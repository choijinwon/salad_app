package com.saladapp.customer.dto;

import java.util.UUID;

public record CustomerRegistrationResponse(
        UUID customerId,
        UUID subscriptionId,
        String uniqueCode
) {
}
