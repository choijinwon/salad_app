package com.saladapp.admin.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record ProductRequest(
        @NotBlank String name,
        @PositiveOrZero Integer price,
        String status,
        String description,
        Integer displayOrder,
        Boolean visible
) {
}
