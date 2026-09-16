package com.saladapp.auth;

import com.saladapp.common.enums.UserRole;
import com.saladapp.customer.Profile;
import com.saladapp.customer.ProfileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private final boolean enabled;
    private final String email;
    private final String name;
    private final String password;
    private final PasswordEncoder passwordEncoder;
    private final ProfileRepository profileRepository;

    public AdminBootstrapRunner(
            @Value("${admin.bootstrap.enabled}") boolean enabled,
            @Value("${admin.bootstrap.email}") String email,
            @Value("${admin.bootstrap.name}") String name,
            @Value("${admin.bootstrap.password}") String password,
            PasswordEncoder passwordEncoder,
            ProfileRepository profileRepository
    ) {
        this.enabled = enabled;
        this.email = email;
        this.name = name;
        this.password = password;
        this.passwordEncoder = passwordEncoder;
        this.profileRepository = profileRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || email == null || email.isBlank() || password == null || password.isBlank()) {
            return;
        }
        profileRepository.findByEmailIgnoreCase(email.trim()).ifPresentOrElse(
                ignored -> {
                },
                () -> profileRepository.save(new Profile(
                        UUID.randomUUID(),
                        UserRole.ADMIN,
                        name == null || name.isBlank() ? "샐러드 관리자" : name.trim(),
                        "010-0000-0000",
                        email.trim(),
                        passwordEncoder.encode(password),
                        null,
                        null,
                        null
                ))
        );
    }
}
