package com.barbarizoo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment")
@Getter
@Setter
public class Payment {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(nullable = false)
    private String provider = "simulated";

    @Column(nullable = false)
    private String type = "DEPOSIT";

    @Column(name = "amount_cents", nullable = false)
    private int amountCents;

    @Column(nullable = false)
    private String currency = "EUR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.REQUIRES_PAYMENT;

    @Column(name = "provider_ref", nullable = false)
    private String providerRef;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
