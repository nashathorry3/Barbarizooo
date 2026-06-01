package com.barbarizoo.repo;

import com.barbarizoo.domain.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffRepository extends JpaRepository<Staff, UUID> {

    List<Staff> findByTenantIdAndActiveTrueOrderByDisplayName(UUID tenantId);

    Optional<Staff> findByIdAndTenantId(UUID id, UUID tenantId);
}
