package com.saladapp.delivery;

import com.saladapp.common.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeliveryScheduleRepository extends JpaRepository<DeliverySchedule, UUID> {

    List<DeliverySchedule> findByDeliveryDate(LocalDate deliveryDate);

    Optional<DeliverySchedule> findBySubscriptionIdAndDeliveryDate(UUID subscriptionId, LocalDate deliveryDate);

    List<DeliverySchedule> findByDriverIdAndDeliveryDate(UUID driverId, LocalDate deliveryDate);

    List<DeliverySchedule> findByZoneIdAndDeliveryDate(UUID zoneId, LocalDate deliveryDate);

    List<DeliverySchedule> findByDeliveryDateAndStatus(LocalDate deliveryDate, DeliveryStatus status);

    List<DeliverySchedule> findByCustomerId(UUID customerId);

    List<DeliverySchedule> findBySubscriptionIdAndDeliveryDateGreaterThanEqual(UUID subscriptionId, LocalDate date);
}
