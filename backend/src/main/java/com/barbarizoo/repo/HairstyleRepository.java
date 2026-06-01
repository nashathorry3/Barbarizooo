package com.barbarizoo.repo;

import com.barbarizoo.domain.Hairstyle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HairstyleRepository extends JpaRepository<Hairstyle, UUID> {
}
