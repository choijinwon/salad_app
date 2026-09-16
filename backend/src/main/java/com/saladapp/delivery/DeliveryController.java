package com.saladapp.delivery;

import com.saladapp.common.ApiResponse;
import com.saladapp.delivery.dto.CompleteDeliveryRequest;
import com.saladapp.delivery.dto.CreateDeliveryRequest;
import com.saladapp.delivery.dto.DeliveryResponse;
import com.saladapp.delivery.dto.UpdateDeliveryRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    @GetMapping("/customer/{customerId}")
    ApiResponse<List<DeliveryResponse>> getCustomerDeliveries(@PathVariable UUID customerId) {
        return ApiResponse.ok(deliveryService.getCustomerDeliveries(customerId));
    }

    @PostMapping
    ApiResponse<DeliveryResponse> createDelivery(@Valid @RequestBody CreateDeliveryRequest request) {
        return ApiResponse.ok(deliveryService.createSchedule(request), "배송일이 예약되었습니다.");
    }

    @PatchMapping("/{deliveryId}/complete")
    ApiResponse<DeliveryResponse> completeDelivery(
            @PathVariable UUID deliveryId,
            @Valid @RequestBody CompleteDeliveryRequest request
    ) {
        return ApiResponse.ok(deliveryService.completeDelivery(deliveryId, request), "배송 완료 처리되었습니다.");
    }

    @PatchMapping("/{deliveryId}/bag-return")
    ApiResponse<DeliveryResponse> updateBagReturned(
            @PathVariable UUID deliveryId,
            @Valid @RequestBody CompleteDeliveryRequest request
    ) {
        return ApiResponse.ok(deliveryService.updateBagReturned(deliveryId, request), "보냉백 회수 상태가 저장되었습니다.");
    }

    @PatchMapping("/{deliveryId}")
    ApiResponse<DeliveryResponse> updateDelivery(
            @PathVariable UUID deliveryId,
            @RequestBody UpdateDeliveryRequest request
    ) {
        return ApiResponse.ok(deliveryService.updateSchedule(deliveryId, request), "배송 일정이 수정되었습니다.");
    }

    @DeleteMapping("/{deliveryId}")
    ApiResponse<Void> deleteDelivery(@PathVariable UUID deliveryId) {
        deliveryService.deleteSchedule(deliveryId);
        return new ApiResponse<>(true, null, "배송 예약이 취소되었습니다.");
    }
}
