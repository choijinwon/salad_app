package com.saladapp.auth;

import com.saladapp.auth.dto.AuthSessionResponse;
import com.saladapp.auth.dto.AdminLoginRequest;
import com.saladapp.auth.dto.CustomerLoginRequest;
import com.saladapp.auth.dto.CustomerSignupRequest;
import com.saladapp.auth.dto.DriverLoginRequest;
import com.saladapp.common.BusinessRuleException;
import com.saladapp.common.enums.OrderSource;
import com.saladapp.common.enums.UserRole;
import com.saladapp.customer.Profile;
import com.saladapp.customer.ProfileRepository;
import com.saladapp.customer.Subscription;
import com.saladapp.customer.SubscriptionRepository;
import com.saladapp.driver.DriverProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class AuthService {

    private static final int DEFAULT_TOTAL_COUNT = 10;
    private static final int DEFAULT_UNIT_PRICE = 8900;

    private final DriverProfileRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileRepository profileRepository;
    private final SubscriptionRepository subscriptionRepository;

    public AuthService(
            DriverProfileRepository driverRepository,
            PasswordEncoder passwordEncoder,
            ProfileRepository profileRepository,
            SubscriptionRepository subscriptionRepository
    ) {
        this.driverRepository = driverRepository;
        this.passwordEncoder = passwordEncoder;
        this.profileRepository = profileRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional
    public AuthSessionResponse signupCustomer(CustomerSignupRequest request) {
        profileRepository.findByEmailIgnoreCase(request.email().trim())
                .ifPresent(profile -> {
                    throw new BusinessRuleException("이미 가입된 이메일입니다.");
                });

        Profile customer = new Profile(
                UUID.randomUUID(),
                UserRole.CUSTOMER,
                request.name().trim(),
                request.phone().trim(),
                request.email().trim(),
                passwordEncoder.encode(request.password()),
                null,
                request.address().trim(),
                null
        );
        Profile savedCustomer = profileRepository.save(customer);
        subscriptionRepository.save(new Subscription(
                UUID.randomUUID(),
                savedCustomer.getId(),
                OrderSource.APP,
                DEFAULT_TOTAL_COUNT,
                DEFAULT_UNIT_PRICE,
                LocalDate.now()
        ));
        return AuthSessionResponse.from(savedCustomer);
    }

    @Transactional(readOnly = true)
    public AuthSessionResponse loginCustomer(CustomerLoginRequest request) {
        Profile profile = findCustomer(request.loginId());
        if (profile.getPasswordHash() == null || !passwordEncoder.matches(request.password(), profile.getPasswordHash())) {
            throw new BusinessRuleException("이메일/전화번호 또는 비밀번호가 올바르지 않습니다.");
        }
        return AuthSessionResponse.from(profile);
    }

    @Transactional(readOnly = true)
    public AuthSessionResponse loginDriver(DriverLoginRequest request) {
        Profile profile = profileRepository.findByRole(UserRole.DRIVER)
                .stream()
                .filter(driver -> normalizePhone(driver.getPhone()).endsWith(normalizePhone(request.phone())))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException("전화번호 또는 비밀번호가 올바르지 않습니다."));

        if (profile.getPasswordHash() == null || !passwordEncoder.matches(request.password(), profile.getPasswordHash())) {
            throw new BusinessRuleException("전화번호 또는 비밀번호가 올바르지 않습니다.");
        }

        boolean active = driverRepository.findByProfileId(profile.getId())
                .map(driver -> driver.isActive())
                .orElse(false);
        if (!active) {
            throw new BusinessRuleException("관리자 승인 후 기사 앱을 사용할 수 있습니다.");
        }
        return AuthSessionResponse.from(profile);
    }

    @Transactional(readOnly = true)
    public AuthSessionResponse loginAdmin(AdminLoginRequest request) {
        Profile profile = profileRepository.findByEmailIgnoreCase(request.email().trim())
                .filter(admin -> admin.getRole() == UserRole.ADMIN)
                .orElseThrow(() -> new BusinessRuleException("관리자 이메일 또는 비밀번호가 올바르지 않습니다."));
        if (profile.getPasswordHash() == null || !passwordEncoder.matches(request.password(), profile.getPasswordHash())) {
            throw new BusinessRuleException("관리자 이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return AuthSessionResponse.from(profile);
    }

    private Profile findCustomer(String loginId) {
        String trimmed = loginId.trim();
        if (trimmed.contains("@")) {
            return profileRepository.findByEmailIgnoreCase(trimmed)
                    .filter(profile -> profile.getRole() == UserRole.CUSTOMER)
                    .orElseThrow(() -> new BusinessRuleException("이메일/전화번호 또는 비밀번호가 올바르지 않습니다."));
        }

        String phone = normalizePhone(trimmed);
        return profileRepository.findByRole(UserRole.CUSTOMER)
                .stream()
                .filter(customer -> normalizePhone(customer.getPhone()).endsWith(phone))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException("이메일/전화번호 또는 비밀번호가 올바르지 않습니다."));
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("[^0-9]", "");
    }
}
