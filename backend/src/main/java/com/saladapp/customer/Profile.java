package com.saladapp.customer;

import com.saladapp.common.enums.UserRole;
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
@Table(name = "profiles")
public class Profile {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private LocalDate birthdate;

    private String address;

    @Column(name = "zone_id")
    private UUID zoneId;

    @Column(name = "unique_code", unique = true)
    private String uniqueCode;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected Profile() {
    }

    public Profile(UUID id, UserRole role, String name, String phone, LocalDate birthdate, String address, UUID zoneId) {
        this.id = id;
        this.role = role;
        this.name = name;
        this.phone = phone;
        this.birthdate = birthdate;
        this.address = address;
        this.zoneId = zoneId;
        this.uniqueCode = generateUniqueCode(name, birthdate, phone);
        this.createdAt = OffsetDateTime.now();
    }

    public static String generateUniqueCode(String name, LocalDate birthdate, String phone) {
        String namePrefix = name.length() <= 2 ? name : name.substring(0, 2);
        String birth = birthdate == null ? "000000" : String.format("%02d%02d%02d", birthdate.getYear() % 100, birthdate.getMonthValue(), birthdate.getDayOfMonth());
        String digits = phone == null ? "" : phone.replaceAll("[^0-9]", "");
        String tail = digits.length() <= 4 ? digits : digits.substring(digits.length() - 4);
        return namePrefix + birth + tail;
    }

    public UUID getId() {
        return id;
    }

    public UserRole getRole() {
        return role;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDate getBirthdate() {
        return birthdate;
    }

    public String getAddress() {
        return address;
    }

    public UUID getZoneId() {
        return zoneId;
    }

    public String getUniqueCode() {
        return uniqueCode;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
