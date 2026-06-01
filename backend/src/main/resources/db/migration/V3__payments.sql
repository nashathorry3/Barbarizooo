-- Payments: deposits taken at booking time to reduce no-shows.
-- Provider-agnostic: a simulated gateway is used in dev; Stripe slots in later
-- behind the same columns (provider + provider_ref).

CREATE TABLE payment (
    id           UUID PRIMARY KEY,
    tenant_id    UUID NOT NULL REFERENCES location(id),
    booking_id   UUID NOT NULL REFERENCES booking(id),
    customer_id  UUID NOT NULL REFERENCES customer(id),
    provider     VARCHAR(20)  NOT NULL DEFAULT 'simulated',
    type         VARCHAR(20)  NOT NULL DEFAULT 'DEPOSIT',   -- DEPOSIT | FULL | REFUND
    amount_cents INTEGER      NOT NULL,
    currency     VARCHAR(3)   NOT NULL DEFAULT 'EUR',
    status       VARCHAR(24)  NOT NULL DEFAULT 'REQUIRES_PAYMENT', -- REQUIRES_PAYMENT | SUCCEEDED | FAILED | REFUNDED
    provider_ref VARCHAR(80)  NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_tenant ON payment(tenant_id);
CREATE INDEX idx_payment_booking ON payment(booking_id);
CREATE UNIQUE INDEX ux_payment_provider_ref ON payment(provider_ref);
