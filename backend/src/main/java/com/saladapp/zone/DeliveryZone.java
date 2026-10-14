package com.saladapp.zone;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "delivery_zones")
public class DeliveryZone {

    @Id
    private UUID id;

    @Column(name = "zone_name", nullable = false)
    private String zoneName;

    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<List<Double>> boundary;

    @Column(length = 7)
    private String color;

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

    public void update(String zoneName, String description) {
        this.zoneName = zoneName;
        this.description = description;
    }

    public UUID getId() {
        return id;
    }

    public void updateBoundary(List<List<Double>> boundary, String color) {
        if (boundary != null) this.boundary = boundary;
        if (color != null) this.color = color;
    }

    public List<List<Double>> getBoundary() {
        return boundary;
    }

    public String getColor() {
        return color;
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
