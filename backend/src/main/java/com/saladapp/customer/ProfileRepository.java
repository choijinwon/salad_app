package com.saladapp.customer;

import com.saladapp.common.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    List<Profile> findByRole(UserRole role);

    Optional<Profile> findByUniqueCode(String uniqueCode);
}
