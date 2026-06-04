package com.barbarizoo.salon;

import com.barbarizoo.common.BadRequestException;
import com.barbarizoo.common.NotFoundException;
import com.barbarizoo.domain.Location;
import com.barbarizoo.repo.LocationRepository;
import com.barbarizoo.salon.SalonController.SalonDto;
import com.barbarizoo.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;
import java.util.UUID;

/** Public salon lookup + owner-side salon settings (name + booking-link slug). */
@Service
public class SalonService {

    private final LocationRepository locations;

    public SalonService(LocationRepository locations) {
        this.locations = locations;
    }

    @Transactional(readOnly = true)
    public SalonDto resolve(String ref) {
        Location salon = locations.findBySlugIgnoreCase(ref)
                .or(() -> tryById(ref))
                .orElseThrow(() -> new NotFoundException("Salon not found"));
        return toDto(salon);
    }

    /** Updates the current tenant's salon name and/or booking-link slug. */
    @Transactional
    public SalonDto updateCurrent(String name, String slug) {
        Location salon = locations.findById(TenantContext.get())
                .orElseThrow(() -> new NotFoundException("Salon not found"));

        if (StringUtils.hasText(name)) {
            salon.setName(name.trim());
        }
        if (StringUtils.hasText(slug)) {
            salon.setSlug(normalizeAndCheckSlug(slug, salon.getId()));
        }
        return toDto(salon);
    }

    private String normalizeAndCheckSlug(String raw, UUID currentId) {
        String slug = raw.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+)|(-+$)", "");
        if (slug.length() < 3) {
            throw new BadRequestException("Slug must be at least 3 characters (letters, numbers, hyphens)");
        }
        locations.findBySlugIgnoreCase(slug).ifPresent(other -> {
            if (!other.getId().equals(currentId)) {
                throw new BadRequestException("That booking link is already taken");
            }
        });
        return slug;
    }

    private Optional<Location> tryById(String ref) {
        try {
            return locations.findById(UUID.fromString(ref));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private SalonDto toDto(Location salon) {
        return new SalonDto(salon.getId(), salon.getName(), salon.getSlug());
    }
}
