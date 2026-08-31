package com.saladapp.zone;

import com.saladapp.common.ApiResponse;
import com.saladapp.zone.dto.DeliveryZoneResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
public class DeliveryZoneController {

    private final DeliveryZoneRepository zoneRepository;

    public DeliveryZoneController(DeliveryZoneRepository zoneRepository) {
        this.zoneRepository = zoneRepository;
    }

    @GetMapping
    ApiResponse<List<DeliveryZoneResponse>> getZones() {
        List<DeliveryZoneResponse> zones = zoneRepository.findAll()
                .stream()
                .map(DeliveryZoneResponse::from)
                .toList();
        return ApiResponse.ok(zones);
    }
}
