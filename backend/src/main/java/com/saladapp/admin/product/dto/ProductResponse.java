package com.saladapp.admin.product.dto;

import com.saladapp.admin.product.SaladProduct;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        int price,
        String status,
        String description,
        int displayOrder,
        boolean visible,
        OffsetDateTime createdAt
) {
    public static ProductResponse from(SaladProduct product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getStatus(),
                product.getDescription(),
                product.getDisplayOrder(),
                product.isVisible(),
                product.getCreatedAt()
        );
    }
}
