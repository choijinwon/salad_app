package com.saladapp.delivery;

import com.saladapp.common.ResourceNotFoundException;
import com.saladapp.customer.ProfileRepository;
import com.saladapp.customer.SubscriptionRepository;
import com.saladapp.delivery.dto.CompleteDeliveryRequest;
import com.saladapp.delivery.dto.DeliveryResponse;
import com.saladapp.zone.DeliveryZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class DeliveryService {

    private final DeliveryScheduleRepository deliveryScheduleRepository;
    private final ProfileRepository profileRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final DeliveryZoneRepository zoneRepository;

    public DeliveryService(
            DeliveryScheduleRepository deliveryScheduleRepository,
            ProfileRepository profileRepository,
            SubscriptionRepository subscriptionRepository,
            DeliveryZoneRepository zoneRepository
    ) {
        this.deliveryScheduleRepository = deliveryScheduleRepository;
        this.profileRepository = profileRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.zoneRepository = zoneRepository;
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getTodayDeliveries(UUID driverId, UUID zoneId) {
        LocalDate today = LocalDate.now();
        List<DeliverySchedule> schedules;
        if (driverId != null) {
            schedules = deliveryScheduleRepository.findByDriverIdAndDeliveryDate(driverId, today);
        } else if (zoneId != null) {
            schedules = deliveryScheduleRepository.findByZoneIdAndDeliveryDate(zoneId, today);
        } else {
            schedules = deliveryScheduleRepository.findByDeliveryDate(today);
        }

        return schedules.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DeliveryResponse completeDelivery(UUID deliveryId, CompleteDeliveryRequest request) {
        DeliverySchedule schedule = deliveryScheduleRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("배송 일정을 찾을 수 없습니다."));
        schedule.complete(request.insulatedBagReturned());
        return toResponse(schedule);
    }

    private DeliveryResponse toResponse(DeliverySchedule schedule) {
        String customerName = profileRepository.findById(schedule.getCustomerId())
                .map(profile -> profile.getName())
                .orElse("");
        String driverName = schedule.getDriverId() == null ? "" : profileRepository.findById(schedule.getDriverId())
                .map(profile -> profile.getName())
                .orElse("");
        String zoneName = schedule.getZoneId() == null ? "" : zoneRepository.findById(schedule.getZoneId())
                .map(zone -> zone.getZoneName())
                .orElse("");
        int unitPrice = subscriptionRepository.findById(schedule.getSubscriptionId())
                .map(subscription -> subscription.getUnitPrice())
                .orElse(0);

        return DeliveryResponse.from(schedule, customerName, driverName, zoneName, unitPrice);
    }
}
