package com.barbarizoo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

/** A salon location = a tenant. Created on self-service Google sign-up. */
@Entity
@Table(name = "location")
@Getter
@Setter
public class Location {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String timezone = "Europe/Berlin";

    @Column(nullable = false)
    private String currency = "EUR";

    @Column(name = "locale_default", nullable = false)
    private String localeDefault = "de";

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime = LocalTime.of(9, 0);

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime = LocalTime.of(18, 0);

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
