package com.saladapp.admin.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "salad_products")
public class SaladProduct {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int price;

    @Column(nullable = false)
    private String status;

    private String description;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean visible;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected SaladProduct() {
    }

    public SaladProduct(UUID id, String name, int price, String status, String description, int displayOrder, boolean visible) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.status = status;
        this.description = description;
        this.displayOrder = displayOrder;
        this.visible = visible;
        this.createdAt = OffsetDateTime.now();
    }

    public void update(String name, int price, String status, String description, int displayOrder, boolean visible) {
        this.name = name;
        this.price = price;
        this.status = status;
        this.description = description;
        this.displayOrder = displayOrder;
        this.visible = visible;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getPrice() {
        return price;
    }

    public String getStatus() {
        return status;
    }

    public String getDescription() {
        return description;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public boolean isVisible() {
        return visible;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
