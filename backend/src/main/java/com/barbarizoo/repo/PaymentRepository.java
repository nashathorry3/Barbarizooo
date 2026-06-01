package com.barbarizoo.repo;

import com.barbarizoo.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    Optional<Payment> findByProviderRef(String providerRef);
}
