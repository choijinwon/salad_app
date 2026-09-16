package com.saladapp.admin;

import com.saladapp.admin.dto.AdminAssignmentRequest;
import com.saladapp.admin.dto.AdminDashboardResponse;
import com.saladapp.common.ApiResponse;
import com.saladapp.common.enums.DeliveryStatus;
import com.saladapp.delivery.DeliveryService;
import com.saladapp.delivery.dto.DeliveryResponse;
import com.saladapp.delivery.dto.UpdateDeliveryRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DeliveryService deliveryService;

    public AdminController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/dashboard/today")
    ApiResponse<AdminDashboardResponse> getDashboard() {
        List<DeliveryResponse> deliveries = deliveryService.getByDate(LocalDate.now(), false);
        return ApiResponse.ok(new AdminDashboardResponse(
                LocalDate.now(),
                deliveries.size(),
                countByStatus(deliveries, DeliveryStatus.DELIVERED),
                countByStatus(deliveries, DeliveryStatus.IN_TRANSIT),
                countByStatus(deliveries, DeliveryStatus.PENDING),
                (int) deliveries.stream().filter(DeliveryResponse::insulatedBagReturned).count()
        ));
    }

    @GetMapping("/assignments")
    ApiResponse<List<DeliveryResponse>> getAssignments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ApiResponse.ok(deliveryService.getByDate(date, false));
    }

    @PatchMapping("/assignments/{deliveryId}")
    ApiResponse<DeliveryResponse> assignDriver(
            @PathVariable UUID deliveryId,
            @RequestBody AdminAssignmentRequest request
    ) {
        return ApiResponse.ok(deliveryService.assignDelivery(deliveryId, request), "배송 기사가 배정되었습니다.");
    }

    @GetMapping("/orders")
    ApiResponse<List<DeliveryResponse>> getOrders(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "false") boolean includeCancelled
    ) {
        return ApiResponse.ok(deliveryService.getByDate(date, includeCancelled));
    }

    @PatchMapping("/orders/{deliveryId}")
    ApiResponse<DeliveryResponse> updateOrder(
            @PathVariable UUID deliveryId,
            @RequestBody UpdateDeliveryRequest request
    ) {
        return ApiResponse.ok(deliveryService.adminUpdateSchedule(deliveryId, request), "주문이 수정되었습니다.");
    }

    @PostMapping("/orders/{deliveryId}/cancel")
    ApiResponse<DeliveryResponse> cancelOrder(@PathVariable UUID deliveryId) {
        return ApiResponse.ok(deliveryService.adminCancelSchedule(deliveryId), "주문이 취소되었습니다.");
    }

    private int countByStatus(List<DeliveryResponse> deliveries, DeliveryStatus status) {
        return (int) deliveries.stream()
                .filter(delivery -> delivery.status() == status)
                .count();
    }
}
