package com.saladapp.delivery.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateDeliveryRequest(
        @NotNull UUID subscriptionId,
        @NotNull @Future LocalDate deliveryDate
) {
}
