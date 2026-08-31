package com.saladapp.driver.dto;

import com.saladapp.common.enums.AttendanceStatus;
import com.saladapp.driver.DriverAttendance;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AttendanceResponse(
        UUID id,
        UUID driverId,
        LocalDate workDate,
        OffsetDateTime clockInTime,
        OffsetDateTime clockOutTime,
        AttendanceStatus status
) {
    public static AttendanceResponse from(DriverAttendance attendance) {
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getDriverId(),
                attendance.getWorkDate(),
                attendance.getClockInTime(),
                attendance.getClockOutTime(),
                attendance.getStatus()
        );
    }
}
