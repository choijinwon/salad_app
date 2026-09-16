package com.saladapp.driver;

import com.saladapp.common.ResourceNotFoundException;
import com.saladapp.common.enums.UserRole;
import com.saladapp.customer.Profile;
import com.saladapp.customer.ProfileRepository;
import com.saladapp.driver.dto.CreateDriverRequest;
import com.saladapp.driver.dto.DriverResponse;
import com.saladapp.driver.dto.UpdateDriverRequest;
import com.saladapp.zone.DeliveryZoneRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class DriverService {

    private final DriverProfileRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileRepository profileRepository;
    private final DeliveryZoneRepository zoneRepository;

    public DriverService(
            DriverProfileRepository driverRepository,
            PasswordEncoder passwordEncoder,
            ProfileRepository profileRepository,
            DeliveryZoneRepository zoneRepository
    ) {
        this.driverRepository = driverRepository;
        this.passwordEncoder = passwordEncoder;
        this.profileRepository = profileRepository;
        this.zoneRepository = zoneRepository;
    }

    @Transactional(readOnly = true)
    public List<DriverResponse> getDrivers() {
        return driverRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(driver -> profileRepository.findById(driver.getProfileId())
                        .map(Profile::getName)
                        .orElse("")))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DriverResponse createDriver(CreateDriverRequest request) {
        Profile profile = new Profile(
                UUID.randomUUID(),
                UserRole.DRIVER,
                request.name(),
                request.phone(),
                null,
                passwordEncoder.encode(request.password()),
                null,
                null,
                request.zoneId()
        );
        Profile savedProfile = profileRepository.save(profile);
        DriverProfile driver = new DriverProfile(
                UUID.randomUUID(),
                savedProfile.getId(),
                request.zoneId(),
                request.vehicleNumber()
        );
        driver.update(request.zoneId(), request.vehicleNumber(), false);
        return toResponse(driverRepository.save(driver));
    }

    @Transactional
    public DriverResponse updateDriver(UUID driverId, UpdateDriverRequest request) {
        DriverProfile driver = driverRepository.findByProfileId(driverId)
                .or(() -> driverRepository.findById(driverId))
                .orElseThrow(() -> new ResourceNotFoundException("기사 정보를 찾을 수 없습니다."));

        boolean nextActive = request.isActive() != null ? request.isActive() : driver.isActive();
        if ("APPROVED".equalsIgnoreCase(request.approvalStatus())) {
            nextActive = true;
        }
        if ("REJECTED".equalsIgnoreCase(request.approvalStatus())) {
            nextActive = false;
        }

        UUID nextZoneId = request.zoneId() != null ? request.zoneId() : driver.getZoneId();
        String nextVehicleNumber = request.vehicleNumber() != null ? request.vehicleNumber() : driver.getVehicleNumber();
        driver.update(nextZoneId, nextVehicleNumber, nextActive);
        return toResponse(driver);
    }

    public DriverResponse toResponse(DriverProfile driver) {
        Profile profile = profileRepository.findById(driver.getProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("기사 프로필을 찾을 수 없습니다."));
        String zoneName = driver.getZoneId() == null ? "" : zoneRepository.findById(driver.getZoneId())
                .map(zone -> zone.getZoneName())
                .orElse("");
        return DriverResponse.from(driver, profile, zoneName);
    }
}
