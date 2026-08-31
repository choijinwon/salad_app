package com.saladapp.settlement;

import com.saladapp.common.enums.DeliveryStatus;
import com.saladapp.delivery.DeliverySchedule;
import com.saladapp.delivery.DeliveryScheduleRepository;
import com.saladapp.settlement.dto.DailySettlementResponse;
import com.saladapp.settlement.dto.SettlementRowResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SettlementService {

    private static final int DEFAULT_UNIT_PRICE = 8900;

    private final DeliveryScheduleRepository deliveryScheduleRepository;

    public SettlementService(DeliveryScheduleRepository deliveryScheduleRepository) {
        this.deliveryScheduleRepository = deliveryScheduleRepository;
    }

    @Transactional(readOnly = true)
    public DailySettlementResponse getDailySettlement(LocalDate settlementDate) {
        LocalDate date = settlementDate == null ? LocalDate.now() : settlementDate;
        List<DeliverySchedule> schedules = deliveryScheduleRepository.findByDeliveryDate(date);
        List<SettlementRowResponse> rows = schedules.stream()
                .map(this::toRow)
                .toList();

        int completed = countByStatus(schedules, DeliveryStatus.DELIVERED);
        int inTransit = countByStatus(schedules, DeliveryStatus.IN_TRANSIT);
        int bagReturned = (int) schedules.stream().filter(DeliverySchedule::isInsulatedBagReturned).count();
        int totalAmount = completed * DEFAULT_UNIT_PRICE;

        return new DailySettlementResponse(
                date,
                schedules.size(),
                completed,
                inTransit,
                bagReturned,
                schedules.size() - bagReturned,
                totalAmount,
                rows
        );
    }

    private SettlementRowResponse toRow(DeliverySchedule schedule) {
        boolean completed = schedule.getStatus() == DeliveryStatus.DELIVERED;
        return new SettlementRowResponse(
                schedule.getId(),
                schedule.getCustomerId(),
                schedule.getZoneId(),
                schedule.getStatus(),
                schedule.isInsulatedBagReturned(),
                completed ? 1 : 0,
                completed ? DEFAULT_UNIT_PRICE : 0
        );
    }

    private int countByStatus(List<DeliverySchedule> schedules, DeliveryStatus status) {
        return (int) schedules.stream()
                .filter(schedule -> schedule.getStatus() == status)
                .count();
    }
}
