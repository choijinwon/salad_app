package com.saladapp.delivery;

import com.saladapp.admin.dto.AdminAssignmentRequest;
import com.saladapp.common.BusinessRuleException;
import com.saladapp.common.ResourceNotFoundException;
import com.saladapp.common.enums.DeliveryStatus;
import com.saladapp.customer.Profile;
import com.saladapp.customer.ProfileRepository;
import com.saladapp.customer.Subscription;
import com.saladapp.customer.SubscriptionRepository;
import com.saladapp.delivery.dto.CompleteDeliveryRequest;
import com.saladapp.delivery.dto.CreateDeliveryRequest;
import com.saladapp.delivery.dto.DeliveryResponse;
import com.saladapp.delivery.dto.UpdateDeliveryRequest;
import com.saladapp.zone.DeliveryZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
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
                .filter(schedule -> schedule.getStatus() != DeliveryStatus.CANCELLED)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getCustomerDeliveries(UUID customerId) {
        return deliveryScheduleRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getByDate(LocalDate deliveryDate, boolean includeCancelled) {
        return deliveryScheduleRepository.findByDeliveryDate(deliveryDate)
                .stream()
                .filter(schedule -> includeCancelled || schedule.getStatus() != DeliveryStatus.CANCELLED)
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DeliveryResponse completeDelivery(UUID deliveryId, CompleteDeliveryRequest request) {
        DeliverySchedule schedule = deliveryScheduleRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("배송 일정을 찾을 수 없습니다."));
        if (schedule.getStatus() == DeliveryStatus.CANCELLED) {
            throw new BusinessRuleException("취소된 배송은 완료 처리할 수 없습니다.");
        }
        boolean firstCompletion = schedule.getStatus() != DeliveryStatus.DELIVERED;
        schedule.complete(request.insulatedBagReturned());
        if (firstCompletion) {
            subscriptionRepository.findById(schedule.getSubscriptionId())
                    .ifPresent(Subscription::decreaseRemainingCount);
        }
        return toResponse(schedule);
    }

    @Transactional
    public DeliveryResponse updateBagReturned(UUID deliveryId, CompleteDeliveryRequest request) {
        DeliverySchedule schedule = deliveryScheduleRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("배송 일정을 찾을 수 없습니다."));
        if (schedule.getStatus() == DeliveryStatus.CANCELLED) {
            throw new BusinessRuleException("취소된 배송은 보냉백 회수 처리할 수 없습니다.");
        }
        schedule.updateBagReturned(request.insulatedBagReturned());
        return toResponse(schedule);
    }

    @Transactional
    public DeliveryResponse createSchedule(CreateDeliveryRequest request) {
        Subscription subscription = subscriptionRepository.findById(request.subscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("구독권을 찾을 수 없습니다."));
        LocalDate date = request.deliveryDate();
        if (!date.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("배송일은 오늘 이후 날짜여야 합니다.");
        }
        if (deliveryScheduleRepository.findBySubscriptionIdAndDeliveryDate(subscription.getId(), date)
                .filter(existing -> existing.getStatus() != DeliveryStatus.CANCELLED)
                .isPresent()) {
            throw new BusinessRuleException("이미 예약된 배송일입니다.");
        }
        Profile customer = profileRepository.findById(subscription.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("고객 정보를 찾을 수 없습니다."));
        int nextRouteOrder = deliveryScheduleRepository.findByDeliveryDate(date).stream()
                .filter(schedule -> schedule.getStatus() != DeliveryStatus.CANCELLED)
                .map(DeliverySchedule::getRouteOrder)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        DeliverySchedule schedule = new DeliverySchedule(
                UUID.randomUUID(),
                subscription.getId(),
                subscription.getCustomerId(),
                date,
                customer.getAddress() == null ? "" : customer.getAddress(),
                null,
                null,
                nextRouteOrder
        );
        return toResponse(deliveryScheduleRepository.save(schedule));
    }

    @Transactional
    public DeliveryResponse updateSchedule(UUID deliveryId, UpdateDeliveryRequest request) {
        DeliverySchedule schedule = deliveryScheduleRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("배송 일정을 찾을 수 없습니다."));
        if (schedule.getStatus() == DeliveryStatus.CANCELLED) {
            throw new BusinessRuleException("취소된 배송은 수정할 수 없습니다.");
        }
        if (request.deliveryDate() != null) {
            LocalDate targetDate = request.deliveryDate();
            if (!targetDate.isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("배송일은 오늘 이후 날짜여야 합니다.");
            }
            if (isLocked(targetDate)) {
                throw new BusinessRuleException("배송 전날 18:00 이후에는 배송일을 변경할 수 없습니다.");
            }
            deliveryScheduleRepository.findBySubscriptionIdAndDeliveryDate(schedule.getSubscriptionId(), targetDate)
                    .filter(existing -> !existing.getId().equals(schedule.getId()))
                    .filter(existing -> existing.getStatus() != DeliveryStatus.CANCELLED)
                    .ifPresent(existing -> {
                        throw new BusinessRuleException("이미 예약된 배송일입니다.");
                    });
            schedule.changeDate(targetDate);
        }
        if (request.deliveryNotes() != null) {
            schedule.changeNotes(request.deliveryNotes());
        }
        return toResponse(schedule);
    }

    @Transactional
    public void deleteSchedule(UUID deliveryId) {
        DeliverySchedule schedule = deliveryScheduleRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("배송 일정을 찾을 수 없습니다."));
        if (schedule.getStatus() != DeliveryStatus.PENDING) {
            throw new BusinessRuleException("진행 중이거나 완료된 배송은 취소할 수 없습니다.");
        }
        if (isLocked(schedule.getDeliveryDate())) {
            throw new BusinessRuleException("배송 전날 18:00 이후에는 예약을 취소할 수 없습니다.");
        }
        schedule.cancel();
        deliveryScheduleRepository.save(schedule);
    }

    @Transactional
    public DeliveryResponse adminUpdateSchedule(UUID deliveryId, UpdateDeliveryRequest request) {
        DeliverySchedule schedule = deliveryScheduleRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("배송 일정을 찾을 수 없습니다."));
        if (schedule.getStatus() == DeliveryStatus.CANCELLED) {
            throw new BusinessRuleException("취소된 배송은 수정할 수 없습니다.");
        }
        if (schedule.getStatus() == DeliveryStatus.DELIVERED && request.deliveryDate() != null) {
            throw new BusinessRuleException("완료된 배송의 날짜는 변경할 수 없습니다.");
        }
        if (request.deliveryDate() != null) {
            LocalDate targetDate = request.deliveryDate();
            if (!targetDate.isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("배송일은 오늘 이후 날짜여야 합니다.");
            }
            deliveryScheduleRepository.findBySubscriptionIdAndDeliveryDate(schedule.getSubscriptionId(), targetDate)
                    .filter(existing -> !existing.getId().equals(schedule.getId()))
                    .filter(existing -> existing.getStatus() != DeliveryStatus.CANCELLED)
                    .ifPresent(existing -> {
                        throw new BusinessRuleException("이미 예약된 배송일입니다.");
                    });
            schedule.changeDate(targetDate);
        }
        if (request.deliveryNotes() != null) {
            schedule.changeNotes(request.deliveryNotes());
        }
        return toResponse(schedule);
    }

    @Transactional
    public DeliveryResponse adminCancelSchedule(UUID deliveryId) {
        DeliverySchedule schedule = deliveryScheduleRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("배송 일정을 찾을 수 없습니다."));
        if (schedule.getStatus() == DeliveryStatus.DELIVERED) {
            throw new BusinessRuleException("완료된 배송은 취소할 수 없습니다.");
        }
        if (schedule.getStatus() == DeliveryStatus.CANCELLED) {
            return toResponse(schedule);
        }
        schedule.cancel();
        return toResponse(deliveryScheduleRepository.save(schedule));
    }

    @Transactional
    public DeliveryResponse assignDelivery(UUID deliveryId, AdminAssignmentRequest request) {
        DeliverySchedule schedule = deliveryScheduleRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("배송 일정을 찾을 수 없습니다."));
        if (schedule.getStatus() == DeliveryStatus.CANCELLED) {
            throw new BusinessRuleException("취소된 배송은 배정할 수 없습니다.");
        }
        schedule.assignDriver(request.driverId(), request.zoneId());
        if (request.routeOrder() != null) {
            schedule.reorder(request.routeOrder());
        }
        return toResponse(schedule);
    }

    private boolean isLocked(LocalDate deliveryDate) {
        LocalDateTime cutoff = deliveryDate.atStartOfDay().minusDays(1).plusHours(18);
        return LocalDateTime.now().isAfter(cutoff);
    }

    public DeliveryResponse toResponse(DeliverySchedule schedule) {
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
