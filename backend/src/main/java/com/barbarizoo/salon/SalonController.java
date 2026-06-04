package com.barbarizoo.salon;

import com.barbarizoo.common.NotFoundException;
import com.barbarizoo.domain.Location;
import com.barbarizoo.repo.LocationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/** Public lookup of a salon by slug or id, used to render its booking page. */
@RestController
@RequestMapping("/api/v1/salons")
public class SalonController {

    private final LocationRepository locations;

    public SalonController(LocationRepository locations) {
        this.locations = locations;
    }

    public record SalonDto(UUID id, String name, String slug) {
    }

    @GetMapping("/{ref}")
    public SalonDto get(@PathVariable String ref) {
        Location salon = locations.findBySlugIgnoreCase(ref)
                .or(() -> tryById(ref))
                .orElseThrow(() -> new NotFoundException("Salon not found"));
        return new SalonDto(salon.getId(), salon.getName(), salon.getSlug());
    }

    private java.util.Optional<Location> tryById(String ref) {
        try {
            return locations.findById(UUID.fromString(ref));
        } catch (IllegalArgumentException e) {
            return java.util.Optional.empty();
        }
    }
}
