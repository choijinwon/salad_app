package com.saladapp.driver;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriverAttendanceRepository extends JpaRepository<DriverAttendance, UUID> {

    List<DriverAttendance> findByWorkDate(LocalDate workDate);

    Optional<DriverAttendance> findByDriverIdAndWorkDate(UUID driverId, LocalDate workDate);
}
