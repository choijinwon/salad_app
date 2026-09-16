package com.saladapp.admin.account;

import com.saladapp.admin.account.dto.AdminAccountRequest;
import com.saladapp.admin.account.dto.AdminAccountResponse;
import com.saladapp.common.BusinessRuleException;
import com.saladapp.common.enums.UserRole;
import com.saladapp.customer.Profile;
import com.saladapp.customer.ProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AdminAccountService {

    private final PasswordEncoder passwordEncoder;
    private final ProfileRepository profileRepository;

    public AdminAccountService(PasswordEncoder passwordEncoder, ProfileRepository profileRepository) {
        this.passwordEncoder = passwordEncoder;
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminAccountResponse> getAdmins() {
        return profileRepository.findByRole(UserRole.ADMIN)
                .stream()
                .map(AdminAccountResponse::from)
                .toList();
    }

    @Transactional
    public AdminAccountResponse createAdmin(AdminAccountRequest request) {
        profileRepository.findByEmailIgnoreCase(request.email().trim())
                .ifPresent(existing -> {
                    throw new BusinessRuleException("이미 등록된 관리자 이메일입니다.");
                });
        Profile profile = new Profile(
                UUID.randomUUID(),
                UserRole.ADMIN,
                request.name().trim(),
                request.phone() == null || request.phone().isBlank() ? "010-0000-0000" : request.phone().trim(),
                request.email().trim(),
                passwordEncoder.encode(request.password()),
                null,
                null,
                null
        );
        return AdminAccountResponse.from(profileRepository.save(profile));
    }
}
