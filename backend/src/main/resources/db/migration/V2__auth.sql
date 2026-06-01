-- Authentication: staff/owner accounts that sign in to the dashboard.
-- Customers still book without an account (public flow). A user belongs to a
-- tenant; the tenant is derived from the JWT, not from a request header.

CREATE TABLE app_user (
    id            UUID PRIMARY KEY,
    tenant_id     UUID NOT NULL REFERENCES location(id),
    email         VARCHAR(190) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    display_name  VARCHAR(120) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'STAFF',   -- OWNER | MANAGER | STAFF
    staff_id      UUID REFERENCES staff(id),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ux_app_user_email ON app_user(email);
CREATE INDEX idx_app_user_tenant ON app_user(tenant_id);
