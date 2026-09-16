package com.saladapp.admin.naver;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "naver_orders")
public class NaverOrder {

    @Id
    private UUID id;

    @Column(name = "naver_order_no", nullable = false, unique = true)
    private String naverOrderNo;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String status;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected NaverOrder() {
    }

    public NaverOrder(UUID id, String naverOrderNo, String customerName, String phone, String address, String status, LocalDate deliveryDate) {
        this.id = id;
        this.naverOrderNo = naverOrderNo;
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.status = status;
        this.deliveryDate = deliveryDate;
        this.createdAt = OffsetDateTime.now();
    }

    public void update(String customerName, String phone, String address, String status, LocalDate deliveryDate) {
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.status = status;
        this.deliveryDate = deliveryDate;
    }

    public UUID getId() {
        return id;
    }

    public String getNaverOrderNo() {
        return naverOrderNo;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
