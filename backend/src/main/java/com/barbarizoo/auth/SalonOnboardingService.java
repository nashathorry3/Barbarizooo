package com.barbarizoo.auth;

import com.barbarizoo.auth.google.GoogleTokenVerifier.VerifiedGoogleUser;
import com.barbarizoo.domain.AppUser;
import com.barbarizoo.domain.Location;
import com.barbarizoo.domain.ServiceEntity;
import com.barbarizoo.domain.Staff;
import com.barbarizoo.repo.AppUserRepository;
import com.barbarizoo.repo.LocationRepository;
import com.barbarizoo.repo.ServiceRepository;
import com.barbarizoo.repo.StaffRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

/**
 * Self-service salon onboarding. When a salon signs up with Google for the first
 * time we provision a brand-new tenant (location), make them the OWNER, and seed
 * a minimal usable setup (one stylist = the owner, plus two starter services) so
 * the dashboard is immediately functional.
 */
@Service
public class SalonOnboardingService {

    private static final Logger log = LoggerFactory.getLogger(SalonOnboardingService.class);

    private final LocationRepository locations;
    private final StaffRepository staff;
    private final ServiceRepository services;
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public SalonOnboardingService(LocationRepository locations, StaffRepository staff,
                                  ServiceRepository services, AppUserRepository users,
                                  PasswordEncoder passwordEncoder) {
        this.locations = locations;
        this.staff = staff;
        this.services = services;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AppUser registerGoogleSalon(VerifiedGoogleUser g) {
        Location salon = new Location();
        salon.setId(UUID.randomUUID());
        salon.setName(deriveSalonName(g));
        salon.setSlug(uniqueSlug(salon.getName()));
        locations.save(salon);

        Staff owner = new Staff();
        owner.setId(UUID.randomUUID());
        owner.setTenantId(salon.getId());
        owner.setDisplayName(g.name());
        owner.setRole("OWNER");
        owner.setSeniorityLevel("SENIOR");
        owner.setColor("#4f46e5");
        owner.setActive(true);
        staff.save(owner);

        seedService(salon.getId(), "Haircut", "HAIR", 30, 2500, owner);
        seedService(salon.getId(), "Beard Trim", "BEARD", 20, 1500, owner);

        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());
        user.setTenantId(salon.getId());
        user.setEmail(g.email());
        user.setDisplayName(g.name());
        user.setRole("OWNER");
        user.setStaffId(owner.getId());
        user.setProvider("google");
        user.setProviderSub(g.sub());
        // OAuth accounts have no usable password; store a random unguessable hash.
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setActive(true);
        users.save(user);

        log.info("Provisioned new salon '{}' (tenant {}) for {}", salon.getName(), salon.getId(), g.email());
        return user;
    }

    private void seedService(UUID tenantId, String name, String category,
                             int durationMin, int priceCents, Staff owner) {
        ServiceEntity service = new ServiceEntity();
        service.setId(UUID.randomUUID());
        service.setTenantId(tenantId);
        service.setName(name);
        service.setCategory(category);
        service.setDurationMin(durationMin);
        service.setBasePriceCents(priceCents);
        service.setVatRate(19);
        service.setActive(true);
        service.setStaff(Set.of(owner));
        services.save(service);
    }

    private String deriveSalonName(VerifiedGoogleUser g) {
        String base = (g.name() != null && !g.name().isBlank())
                ? g.name().trim()
                : g.email().split("@")[0];
        return base + "'s Salon";
    }

    /** Builds a URL-safe, unique slug from the salon name (e.g. "Sara's Salon" -> "saras-salon"). */
    private String uniqueSlug(String name) {
        String base = name.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+)|(-+$)", "");
        if (base.isBlank()) {
            base = "salon";
        }
        String candidate = base;
        while (locations.existsBySlugIgnoreCase(candidate)) {
            candidate = base + "-" + UUID.randomUUID().toString().substring(0, 4);
        }
        return candidate;
    }
}
