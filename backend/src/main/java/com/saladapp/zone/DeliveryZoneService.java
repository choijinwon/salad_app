package com.saladapp.zone;

import com.saladapp.common.ResourceNotFoundException;
import com.saladapp.zone.dto.DeliveryZoneResponse;
import com.saladapp.zone.dto.ZoneRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DeliveryZoneService {

    private final DeliveryZoneRepository zoneRepository;

    public DeliveryZoneService(DeliveryZoneRepository zoneRepository) {
        this.zoneRepository = zoneRepository;
    }

    @Transactional(readOnly = true)
    public List<DeliveryZoneResponse> getZones() {
        return zoneRepository.findAll()
                .stream()
                .map(DeliveryZoneResponse::from)
                .toList();
    }

    @Transactional
    public DeliveryZoneResponse createZone(ZoneRequest request) {
        DeliveryZone zone = new DeliveryZone(UUID.randomUUID(), request.zoneName(), request.description());
        return DeliveryZoneResponse.from(zoneRepository.save(zone));
    }

    @Transactional
    public DeliveryZoneResponse updateZone(UUID zoneId, ZoneRequest request) {
        DeliveryZone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResourceNotFoundException("배송 구역을 찾을 수 없습니다."));
        zone.update(request.zoneName(), request.description());
        return DeliveryZoneResponse.from(zone);
    }
}
