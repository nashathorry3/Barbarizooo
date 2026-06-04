package com.barbarizoo.salon;

import jakarta.validation.constraints.NotBlank;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/salons")
public class SalonController {

    private final SalonService salons;

    public SalonController(SalonService salons) {
        this.salons = salons;
    }

    public record SalonDto(UUID id, String name, String slug) {
    }

    public record UpdateSalonRequest(@NotBlank String name, String slug) {
    }

    /** Public: resolve a salon by slug or id to render its booking page. */
    @GetMapping("/{ref}")
    public SalonDto get(@PathVariable String ref) {
        return salons.resolve(ref);
    }

    /** Owner: update this salon's name and booking-link slug. */
    @PatchMapping
    @PreAuthorize("hasRole('OWNER')")
    public SalonDto update(@RequestBody UpdateSalonRequest request) {
        return salons.updateCurrent(request.name(), request.slug());
    }
}
