package com.saladapp.driver;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "driver_profiles")
public class DriverProfile {

    @Id
    private UUID id;

    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @Column(name = "zone_id")
    private UUID zoneId;

    @Column(name = "vehicle_number")
    private String vehicleNumber;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    protected DriverProfile() {
    }

    public DriverProfile(UUID id, UUID profileId, UUID zoneId, String vehicleNumber) {
        this.id = id;
        this.profileId = profileId;
        this.zoneId = zoneId;
        this.vehicleNumber = vehicleNumber;
        this.active = true;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProfileId() {
        return profileId;
    }

    public UUID getZoneId() {
        return zoneId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public boolean isActive() {
        return active;
    }
}
