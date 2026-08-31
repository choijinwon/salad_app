package com.saladapp.customer;

import com.saladapp.common.enums.OrderSource;
import com.saladapp.common.enums.SubscriptionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    private UUID id;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_source", nullable = false)
    private OrderSource orderSource;

    @Column(name = "total_count", nullable = false)
    private int totalCount;

    @Column(name = "remaining_count", nullable = false)
    private int remainingCount;

    @Column(name = "unit_price", nullable = false)
    private int unitPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected Subscription() {
    }

    public Subscription(UUID id, UUID customerId, OrderSource orderSource, int totalCount, int unitPrice, LocalDate startDate) {
        this.id = id;
        this.customerId = customerId;
        this.orderSource = orderSource;
        this.totalCount = totalCount;
        this.remainingCount = totalCount;
        this.unitPrice = unitPrice;
        this.status = SubscriptionStatus.ACTIVE;
        this.startDate = startDate;
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public OrderSource getOrderSource() {
        return orderSource;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public int getRemainingCount() {
        return remainingCount;
    }

    public int getUnitPrice() {
        return unitPrice;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
