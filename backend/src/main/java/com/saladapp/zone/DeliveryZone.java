package com.saladapp.zone;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "delivery_zones")
public class DeliveryZone {

    @Id
    private UUID id;

    @Column(name = "zone_name", nullable = false)
    private String zoneName;

    private String description;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected DeliveryZone() {
    }

    public DeliveryZone(UUID id, String zoneName, String description) {
        this.id = id;
        this.zoneName = zoneName;
        this.description = description;
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public String getZoneName() {
        return zoneName;
    }

    public String getDescription() {
        return description;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
