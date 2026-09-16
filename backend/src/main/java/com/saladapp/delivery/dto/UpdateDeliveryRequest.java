package com.saladapp.delivery.dto;

import java.time.LocalDate;

public record UpdateDeliveryRequest(
        LocalDate deliveryDate,
        String deliveryNotes
) {
}
