package com.barbarizoo.config;

import com.barbarizoo.domain.AppUser;
import com.barbarizoo.repo.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Seeds a demo owner account on first start so the dashboard is usable out of
 * the box. Credentials: owner@demo.barbarizoo / password123 (dev only).
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final UUID DEMO_TENANT = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID DEMO_STAFF = UUID.fromString("22222222-0000-0000-0000-000000000001");
    private static final String DEMO_EMAIL = "owner@demo.barbarizoo";
    private static final String DEMO_PASSWORD = "password123";

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AppUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (users.existsByEmailIgnoreCase(DEMO_EMAIL)) {
            return;
        }
        AppUser owner = new AppUser();
        owner.setId(UUID.randomUUID());
        owner.setTenantId(DEMO_TENANT);
        owner.setEmail(DEMO_EMAIL);
        owner.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        owner.setDisplayName("Mehmet (Owner)");
        owner.setRole("OWNER");
        owner.setStaffId(DEMO_STAFF);
        users.save(owner);
        log.info("Seeded demo owner account: {} / {}", DEMO_EMAIL, DEMO_PASSWORD);
    }
}
