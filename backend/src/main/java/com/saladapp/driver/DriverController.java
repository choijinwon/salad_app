package com.saladapp.driver;

import com.saladapp.common.ApiResponse;
import com.saladapp.driver.dto.AttendanceLocationRequest;
import com.saladapp.driver.dto.AttendanceResponse;
import com.saladapp.driver.dto.CreateDriverRequest;
import com.saladapp.driver.dto.DriverResponse;
import com.saladapp.driver.dto.UpdateDriverRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverAttendanceService attendanceService;
    private final DriverService driverService;

    public DriverController(DriverAttendanceService attendanceService, DriverService driverService) {
        this.attendanceService = attendanceService;
        this.driverService = driverService;
    }

    @GetMapping
    ApiResponse<List<DriverResponse>> getDrivers() {
        return ApiResponse.ok(driverService.getDrivers());
    }

    @PostMapping
    ApiResponse<DriverResponse> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        return ApiResponse.ok(driverService.createDriver(request), "기사가 등록되었습니다.");
    }

    @PatchMapping("/{driverId}")
    ApiResponse<DriverResponse> updateDriver(
            @PathVariable UUID driverId,
            @RequestBody UpdateDriverRequest request
    ) {
        return ApiResponse.ok(driverService.updateDriver(driverId, request), "기사 정보가 수정되었습니다.");
    }

    @GetMapping("/attendances/today")
    ApiResponse<List<AttendanceResponse>> getTodayAttendances() {
        return ApiResponse.ok(attendanceService.getTodayAttendances());
    }

    @PostMapping("/{driverId}/attendance/clock-in")
    ApiResponse<AttendanceResponse> clockIn(
            @PathVariable UUID driverId,
            @Valid @RequestBody AttendanceLocationRequest request
    ) {
        return ApiResponse.ok(attendanceService.clockIn(driverId, request), "출근 처리되었습니다.");
    }

    @PostMapping("/{driverId}/attendance/clock-out")
    ApiResponse<AttendanceResponse> clockOut(
            @PathVariable UUID driverId,
            @Valid @RequestBody AttendanceLocationRequest request
    ) {
        return ApiResponse.ok(attendanceService.clockOut(driverId, request), "퇴근 처리되었습니다.");
    }
}