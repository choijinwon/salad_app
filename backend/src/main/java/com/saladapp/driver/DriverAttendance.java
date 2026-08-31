package com.saladapp.driver;

import com.saladapp.common.enums.AttendanceStatus;
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
@Table(name = "driver_attendances")
public class DriverAttendance {

    @Id
    private UUID id;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "clock_in_time")
    private OffsetDateTime clockInTime;

    @Column(name = "clock_out_time")
    private OffsetDateTime clockOutTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @Column(name = "clock_in_latitude")
    private BigDecimal clockInLatitude;

    @Column(name = "clock_in_longitude")
    private BigDecimal clockInLongitude;

    @Column(name = "clock_out_latitude")
    private BigDecimal clockOutLatitude;

    @Column(name = "clock_out_longitude")
    private BigDecimal clockOutLongitude;

    protected DriverAttendance() {
    }

    public DriverAttendance(UUID id, UUID driverId, LocalDate workDate) {
        this.id = id;
        this.driverId = driverId;
        this.workDate = workDate;
        this.status = AttendanceStatus.ABSENT;
    }

    public void clockIn(BigDecimal latitude, BigDecimal longitude) {
        this.clockInTime = OffsetDateTime.now();
        this.clockInLatitude = latitude;
        this.clockInLongitude = longitude;
        this.status = AttendanceStatus.CLOCKED_IN;
    }

    public void clockOut(BigDecimal latitude, BigDecimal longitude) {
        this.clockOutTime = OffsetDateTime.now();
        this.clockOutLatitude = latitude;
        this.clockOutLongitude = longitude;
        this.status = AttendanceStatus.CLOCKED_OUT;
    }

    public UUID getId() {
        return id;
    }

    public UUID getDriverId() {
        return driverId;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public OffsetDateTime getClockInTime() {
        return clockInTime;
    }

    public OffsetDateTime getClockOutTime() {
        return clockOutTime;
    }

    public AttendanceStatus getStatus() {
        return status;
    }
}
