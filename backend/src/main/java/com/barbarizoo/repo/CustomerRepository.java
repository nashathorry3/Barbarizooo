package com.barbarizoo.repo;

import com.barbarizoo.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByTenantIdAndEmailIgnoreCase(UUID tenantId, String email);
}
