package com.barbarizoo.repo;

import com.barbarizoo.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByEmailIgnoreCaseAndActiveTrue(String email);

    boolean existsByEmailIgnoreCase(String email);
}
