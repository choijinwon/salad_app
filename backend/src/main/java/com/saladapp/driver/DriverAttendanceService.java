package com.saladapp.driver;

import com.saladapp.driver.dto.AttendanceLocationRequest;
import com.saladapp.driver.dto.AttendanceResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class DriverAttendanceService {

    private final DriverAttendanceRepository attendanceRepository;

    public DriverAttendanceService(DriverAttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getTodayAttendances() {
        return attendanceRepository.findByWorkDate(LocalDate.now())
                .stream()
                .map(AttendanceResponse::from)
                .toList();
    }

    @Transactional
    public AttendanceResponse clockIn(UUID driverId, AttendanceLocationRequest request) {
        DriverAttendance attendance = attendanceRepository.findByDriverIdAndWorkDate(driverId, LocalDate.now())
                .orElseGet(() -> new DriverAttendance(UUID.randomUUID(), driverId, LocalDate.now()));
        attendance.clockIn(request.latitude(), request.longitude());
        return AttendanceResponse.from(attendanceRepository.save(attendance));
    }

    @Transactional
    public AttendanceResponse clockOut(UUID driverId, AttendanceLocationRequest request) {
        DriverAttendance attendance = attendanceRepository.findByDriverIdAndWorkDate(driverId, LocalDate.now())
                .orElseGet(() -> new DriverAttendance(UUID.randomUUID(), driverId, LocalDate.now()));
        attendance.clockOut(request.latitude(), request.longitude());
        return AttendanceResponse.from(attendanceRepository.save(attendance));
    }
}
