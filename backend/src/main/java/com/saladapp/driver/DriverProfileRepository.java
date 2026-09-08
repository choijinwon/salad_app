package com.saladapp.driver;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriverProfileRepository extends JpaRepository<DriverProfile, UUID> {

    List<DriverProfile> findByActiveTrue();

    List<DriverProfile> findByZoneIdAndActiveTrue(UUID zoneId);

    Optional<DriverProfile> findByProfileId(UUID profileId);
}
