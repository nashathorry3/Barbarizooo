package com.barbarizoo.payments;

import com.barbarizoo.domain.PaymentStatus;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public final class PaymentDtos {

    private PaymentDtos() {
    }

    public record CreateDepositRequest(@NotNull UUID bookingId) {
    }

    /** Returned to the client to complete payment (client secret used by the PSP SDK). */
    public record DepositIntentResponse(
            UUID paymentId, String providerRef, String clientSecret,
            int amountCents, String currency, PaymentStatus status) {
    }

    public record PaymentDto(
            UUID id, UUID bookingId, String provider, String type,
            int amountCents, String currency, PaymentStatus status,
            String providerRef, Instant createdAt) {
    }
}
