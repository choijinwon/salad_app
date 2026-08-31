package com.saladapp.zone;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DeliveryZoneRepository extends JpaRepository<DeliveryZone, UUID> {
}
