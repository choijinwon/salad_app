package com.saladapp.admin.naver.dto;

import com.saladapp.admin.naver.NaverOrder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record NaverOrderResponse(
        UUID id,
        String naverOrderNo,
        String customerName,
        String phone,
        String address,
        String status,
        LocalDate deliveryDate,
        OffsetDateTime createdAt
) {
    public static NaverOrderResponse from(NaverOrder order) {
        return new NaverOrderResponse(
                order.getId(),
                order.getNaverOrderNo(),
                order.getCustomerName(),
                order.getPhone(),
                order.getAddress(),
                order.getStatus(),
                order.getDeliveryDate(),
                order.getCreatedAt()
        );
    }
}
