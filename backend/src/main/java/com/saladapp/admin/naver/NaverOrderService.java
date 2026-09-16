package com.saladapp.admin.naver;

import com.saladapp.admin.naver.dto.NaverOrderRequest;
import com.saladapp.admin.naver.dto.NaverOrderResponse;
import com.saladapp.common.BusinessRuleException;
import com.saladapp.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class NaverOrderService {

    private static final Set<String> STATUSES = Set.of("NEEDS_CONFIRMATION", "LINKED", "RESERVED", "CANCELLED");

    private final NaverOrderRepository naverOrderRepository;

    public NaverOrderService(NaverOrderRepository naverOrderRepository) {
        this.naverOrderRepository = naverOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<NaverOrderResponse> getOrders() {
        return naverOrderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(NaverOrderResponse::from)
                .toList();
    }

    @Transactional
    public NaverOrderResponse createOrder(NaverOrderRequest request) {
        naverOrderRepository.findByNaverOrderNo(request.naverOrderNo().trim())
                .ifPresent(existing -> {
                    throw new BusinessRuleException("이미 등록된 네이버 주문번호입니다.");
                });
        NaverOrder order = new NaverOrder(
                UUID.randomUUID(),
                request.naverOrderNo().trim(),
                request.customerName().trim(),
                request.phone().trim(),
                request.address().trim(),
                normalizeStatus(request.status()),
                request.deliveryDate()
        );
        return NaverOrderResponse.from(naverOrderRepository.save(order));
    }

    @Transactional
    public NaverOrderResponse updateOrder(UUID orderId, NaverOrderRequest request) {
        NaverOrder order = naverOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("네이버 주문을 찾을 수 없습니다."));
        order.update(
                request.customerName().trim(),
                request.phone().trim(),
                request.address().trim(),
                normalizeStatus(request.status()),
                request.deliveryDate()
        );
        return NaverOrderResponse.from(order);
    }

    private String normalizeStatus(String status) {
        String normalized = status == null || status.isBlank() ? "NEEDS_CONFIRMATION" : status.trim().toUpperCase();
        if (!STATUSES.contains(normalized)) {
            throw new BusinessRuleException("네이버 주문 상태가 올바르지 않습니다.");
        }
        return normalized;
    }
}
