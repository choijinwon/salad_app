package com.saladapp.delivery.dto;

import jakarta.validation.constraints.NotNull;

public record CompleteDeliveryRequest(
        @NotNull Boolean insulatedBagReturned
) {
}
