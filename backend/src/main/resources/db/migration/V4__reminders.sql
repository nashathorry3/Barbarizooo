-- Reminders / notifications scheduled around bookings (confirmation + pre-visit).
-- Channel-agnostic: a simulated sender logs them; WhatsApp/Email providers slot in later.

CREATE TABLE reminder (
    id          UUID PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES location(id),
    booking_id  UUID NOT NULL REFERENCES booking(id),
    type        VARCHAR(20) NOT NULL,                     -- CONFIRMATION | REMINDER_24H | REMINDER_2H
    channel     VARCHAR(12) NOT NULL,                     -- EMAIL | WHATSAPP
    recipient   VARCHAR(190) NOT NULL,
    body        VARCHAR(500) NOT NULL,
    send_at     TIMESTAMP   NOT NULL,
    status      VARCHAR(12) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED | SENT | FAILED | CANCELLED
    sent_at     TIMESTAMP,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminder_due ON reminder(status, send_at);
CREATE INDEX idx_reminder_tenant ON reminder(tenant_id);
CREATE INDEX idx_reminder_booking ON reminder(booking_id);
