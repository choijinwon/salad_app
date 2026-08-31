package com.saladapp.delivery;

import com.saladapp.common.ApiResponse;
import com.saladapp.delivery.dto.CompleteDeliveryRequest;
import com.saladapp.delivery.dto.DeliveryResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/today")
    ApiResponse<List<DeliveryResponse>> getTodayDeliveries(
            @RequestParam(required = false) UUID driverId,
            @RequestParam(required = false) UUID zoneId
    ) {
        return ApiResponse.ok(deliveryService.getTodayDeliveries(driverId, zoneId));
    }

    @PatchMapping("/{deliveryId}/complete")
    ApiResponse<DeliveryResponse> completeDelivery(
            @PathVariable UUID deliveryId,
            @Valid @RequestBody CompleteDeliveryRequest request
    ) {
        return ApiResponse.ok(deliveryService.completeDelivery(deliveryId, request), "배송 완료 처리되었습니다.");
    }
}
