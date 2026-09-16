package com.saladapp.admin.naver;

import com.saladapp.admin.naver.dto.NaverOrderRequest;
import com.saladapp.admin.naver.dto.NaverOrderResponse;
import com.saladapp.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/naver-orders")
public class NaverOrderController {

    private final NaverOrderService naverOrderService;

    public NaverOrderController(NaverOrderService naverOrderService) {
        this.naverOrderService = naverOrderService;
    }

    @GetMapping
    ApiResponse<List<NaverOrderResponse>> getOrders() {
        return ApiResponse.ok(naverOrderService.getOrders());
    }

    @PostMapping
    ApiResponse<NaverOrderResponse> createOrder(@Valid @RequestBody NaverOrderRequest request) {
        return ApiResponse.ok(naverOrderService.createOrder(request), "네이버 주문이 등록되었습니다.");
    }

    @PatchMapping("/{orderId}")
    ApiResponse<NaverOrderResponse> updateOrder(
            @PathVariable UUID orderId,
            @Valid @RequestBody NaverOrderRequest request
    ) {
        return ApiResponse.ok(naverOrderService.updateOrder(orderId, request), "네이버 주문이 수정되었습니다.");
    }
}
