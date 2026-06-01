package com.barbarizoo.repo;

import com.barbarizoo.domain.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceRepository extends JpaRepository<ServiceEntity, UUID> {

    List<ServiceEntity> findByTenantIdAndActiveTrueOrderByName(UUID tenantId);

    Optional<ServiceEntity> findByIdAndTenantId(UUID id, UUID tenantId);
}
