package com.saladapp.zone;

import com.saladapp.common.ApiResponse;
import com.saladapp.zone.dto.DeliveryZoneResponse;
import com.saladapp.zone.dto.ZoneRequest;
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
@RequestMapping("/api/zones")
public class DeliveryZoneController {

    private final DeliveryZoneService zoneService;

    public DeliveryZoneController(DeliveryZoneService zoneService) {
        this.zoneService = zoneService;
    }

    @GetMapping
    ApiResponse<List<DeliveryZoneResponse>> getZones() {
        return ApiResponse.ok(zoneService.getZones());
    }

    @PostMapping
    ApiResponse<DeliveryZoneResponse> createZone(@Valid @RequestBody ZoneRequest request) {
        return ApiResponse.ok(zoneService.createZone(request), "배송 구역이 등록되었습니다.");
    }

    @PatchMapping("/{zoneId}")
    ApiResponse<DeliveryZoneResponse> updateZone(
            @PathVariable UUID zoneId,
            @Valid @RequestBody ZoneRequest request
    ) {
        return ApiResponse.ok(zoneService.updateZone(zoneId, request), "배송 구역이 수정되었습니다.");
    }
}