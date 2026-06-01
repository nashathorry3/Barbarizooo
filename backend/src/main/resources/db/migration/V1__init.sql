-- Barbarizoo booking-core schema (MVP vertical slice).
-- Multi-tenant: every business row carries tenant_id (= location id).
-- Money is stored in integer cents. Compatible with PostgreSQL and H2 (PostgreSQL mode).

CREATE TABLE location (
    id              UUID PRIMARY KEY,
    name            VARCHAR(160) NOT NULL,
    timezone        VARCHAR(64)  NOT NULL DEFAULT 'Europe/Berlin',
    currency        VARCHAR(3)   NOT NULL DEFAULT 'EUR',
    locale_default  VARCHAR(8)   NOT NULL DEFAULT 'de',
    opening_time    TIME         NOT NULL DEFAULT '09:00:00',
    closing_time    TIME         NOT NULL DEFAULT '18:00:00',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff (
    id              UUID PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES location(id),
    display_name    VARCHAR(120) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'STYLIST',
    seniority_level VARCHAR(20)  NOT NULL DEFAULT 'STANDARD',
    color           VARCHAR(9)   NOT NULL DEFAULT '#4f46e5',
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_staff_tenant ON staff(tenant_id);

CREATE TABLE service (
    id               UUID PRIMARY KEY,
    tenant_id        UUID NOT NULL REFERENCES location(id),
    name             VARCHAR(160) NOT NULL,
    category         VARCHAR(60)  NOT NULL DEFAULT 'HAIR',
    duration_min     INTEGER      NOT NULL,
    base_price_cents INTEGER      NOT NULL,
    vat_rate         INTEGER      NOT NULL DEFAULT 19,
    active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_service_tenant ON service(tenant_id);

CREATE TABLE service_staff (
    service_id UUID NOT NULL REFERENCES service(id),
    staff_id   UUID NOT NULL REFERENCES staff(id),
    PRIMARY KEY (service_id, staff_id)
);

CREATE TABLE customer (
    id                UUID PRIMARY KEY,
    tenant_id         UUID NOT NULL REFERENCES location(id),
    name              VARCHAR(160) NOT NULL,
    email             VARCHAR(190),
    phone             VARCHAR(40),
    locale            VARCHAR(8)  NOT NULL DEFAULT 'de',
    marketing_consent BOOLEAN     NOT NULL DEFAULT FALSE,
    notes             VARCHAR(1000),
    created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_customer_tenant ON customer(tenant_id);

CREATE TABLE booking (
    id           UUID PRIMARY KEY,
    tenant_id    UUID NOT NULL REFERENCES location(id),
    customer_id  UUID NOT NULL REFERENCES customer(id),
    staff_id     UUID NOT NULL REFERENCES staff(id),
    service_id   UUID NOT NULL REFERENCES service(id),
    starts_at    TIMESTAMP   NOT NULL,
    ends_at      TIMESTAMP   NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    price_cents  INTEGER     NOT NULL,
    source       VARCHAR(20) NOT NULL DEFAULT 'WEB',
    created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_booking_tenant_start ON booking(tenant_id, starts_at);
CREATE INDEX idx_booking_staff_start  ON booking(staff_id, starts_at);

-- ---------------------------------------------------------------------------
-- Seed data: one demo barbershop (the default tenant).
-- ---------------------------------------------------------------------------
INSERT INTO location (id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Barbarizoo Demo Barbershop Berlin');

INSERT INTO staff (id, tenant_id, display_name, role, seniority_level, color) VALUES
    ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Mehmet',  'OWNER',   'SENIOR',   '#4f46e5'),
    ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Lena',    'STYLIST', 'STANDARD', '#db2777');

INSERT INTO service (id, tenant_id, name, category, duration_min, base_price_cents) VALUES
    ('33333333-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Classic Haircut',    'HAIR',  30, 2500),
    ('33333333-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Skin Fade',          'HAIR',  45, 3200),
    ('33333333-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Beard Trim',         'BEARD', 20, 1500),
    ('33333333-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Haircut + Beard',    'COMBO', 60, 4000);

INSERT INTO service_staff (service_id, staff_id) VALUES
    ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
    ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002'),
    ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001'),
    ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002'),
    ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001'),
    ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001');
