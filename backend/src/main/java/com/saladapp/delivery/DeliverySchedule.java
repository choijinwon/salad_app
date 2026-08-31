package com.saladapp.delivery;

import com.saladapp.common.enums.DeliveryStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "delivery_schedules")
public class DeliverySchedule {

    @Id
    private UUID id;

    @Column(name = "subscription_id", nullable = false)
    private UUID subscriptionId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "zone_id")
    private UUID zoneId;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;

    @Column(name = "route_order")
    private Integer routeOrder;

    @Column(nullable = false)
    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @Column(name = "delivery_notes")
    private String deliveryNotes;

    @Column(name = "insulated_bag_returned", nullable = false)
    private boolean insulatedBagReturned;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected DeliverySchedule() {
    }

    public void complete(boolean bagReturned) {
        this.status = DeliveryStatus.DELIVERED;
        this.insulatedBagReturned = bagReturned;
        this.completedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getSubscriptionId() {
        return subscriptionId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public UUID getDriverId() {
        return driverId;
    }

    public UUID getZoneId() {
        return zoneId;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public Integer getRouteOrder() {
        return routeOrder;
    }

    public String getAddress() {
        return address;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public String getDeliveryNotes() {
        return deliveryNotes;
    }

    public boolean isInsulatedBagReturned() {
        return insulatedBagReturned;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
