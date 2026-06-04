package com.barbarizoo.repo;

import com.barbarizoo.domain.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {

    Optional<Location> findBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCase(String slug);
}
