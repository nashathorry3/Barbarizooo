# 5 · API Architecture

## 5.1 Style & shape

- **Modular monolith first**, carved into clear bounded contexts; extract high-load/AI contexts into services as scale demands. This keeps MVP velocity high while leaving seams for later.
- **API surface:** REST (resource CRUD, webhooks) + a **GraphQL gateway** for the dashboard/app aggregation needs. Public partner API is REST + signed webhooks.
- **Auth:** OAuth2 / OIDC, JWT access tokens (short-lived) + refresh; role- & tenant-scoped claims. RLS in DB as defense-in-depth.
- **Tenancy:** every request carries `tenant_id` (from token or subdomain); enforced in middleware + DB RLS.
- **Async:** event bus (Kafka/NATS or managed pub/sub) for cross-context events; workers for reminders, AI inference, forecasting, reorder.

## 5.2 Bounded contexts (services/modules)

| Context | Responsibility |
|---------|----------------|
| **Identity & Tenancy** | Orgs, locations, users, roles, auth |
| **Booking** | Availability, bookings, waitlist, reminders |
| **Payments** | Stripe/PayPal/Klarna/SEPA, deposits, refunds, POS, gift cards, memberships |
| **Catalog** | Services, staff skills, working hours |
| **Pricing** | Rules engine + ML price/demand quotes |
| **Inventory** | Stock, movements, suppliers, POs, forecasts |
| **CRM** | Customers, loyalty, referrals, segments |
| **AI Studio** | Hairstyle preview inference + recommendations |
| **Receptionist** | Omnichannel inbox, intent, actions, handoff |
| **Analytics/Reporting** | Aggregations, P&L, exports |
| **Compliance** | Consent, audit, data-deletion, tax/VAT |

## 5.3 Representative REST endpoints

```
# Booking
GET    /v1/availability?service_id&staff_id&date        -> free slots (with dynamic price)
POST   /v1/bookings                                     -> create (returns deposit intent)
PATCH  /v1/bookings/{id}                                -> reschedule/cancel/no-show
POST   /v1/waitlist                                     -> join
POST   /v1/bookings/{id}/checkin | /checkout

# Pricing
POST   /v1/pricing/quote        { service_id, staff_id, slot } -> {base, final, applied_rules}
GET    /v1/pricing/rules        | POST /v1/pricing/rules
POST   /v1/pricing/simulate     { rule_changes } -> projected revenue impact

# Inventory
GET    /v1/inventory/stock
POST   /v1/inventory/movements
GET    /v1/inventory/forecast                           -> stock-out predictions
POST   /v1/purchase-orders

# AI Studio
POST   /v1/studio/sessions      (consent required)      -> session token
POST   /v1/studio/preview       { session, style_id, color } -> result image url (ephemeral)
GET    /v1/studio/recommendations?session               -> styles by face shape/trend

# Receptionist (webhooks in, actions out)
POST   /v1/receptionist/inbound/{channel}               -> WhatsApp/IG/web/voice
POST   /v1/receptionist/{conversation}/handoff

# Payments & webhooks
POST   /v1/payments/intents
POST   /v1/webhooks/stripe | /paypal                    -> signed
GET    /v1/reports/revenue | /pnl | /staff   ?from&to&format=pdf|xlsx
```

## 5.4 Key domain events (event bus)

```
booking.created / .confirmed / .cancelled / .no_show / .completed
payment.succeeded / .refunded
inventory.movement.recorded / stock.low / forecast.generated
pricing.quote.created / rule.changed
studio.preview.generated
receptionist.message.received / action.taken / handoff.requested
customer.consent.changed / customer.erasure.requested
```

These drive: reminder scheduling, waitlist auto-offer, inventory decrement on service usage, forecast refresh, loyalty accrual, analytics ingestion, and audit logging.

## 5.5 Third-party integrations

| Capability | Provider(s) |
|------------|-------------|
| Payments | Stripe (primary), PayPal, Klarna, SEPA |
| Messaging | WhatsApp Business API (Meta/360dialog), SMS (Twilio/Sinch), Email (Postmark/SES) |
| Voice AI | Telephony (Twilio Voice) + STT/TTS + LLM |
| Calendars | Google / Apple / Outlook (2-way for staff) |
| Accounting | DATEV, lexoffice export |
| AI inference | EU-hosted GPU (hairstyle), LLM provider (receptionist) with EU data terms |
| Maps/geo | For discovery & local-events signals |

## 5.6 Non-functional requirements

- **Availability:** 99.9% for booking/payments; graceful degradation (if AI down, booking still works).
- **Latency:** availability < 300ms p95; preview inference target < 6s; quote < 200ms (rules) / < 800ms (ML).
- **Idempotency:** all payment & booking mutations use idempotency keys.
- **Rate limiting & abuse protection** on public booking + studio (cost control on inference).
- **Observability:** tracing, structured logs, per-tenant metrics; cost-per-tenant for AI usage.
- **Data residency:** all PII and inference in EU regions.

## 5.7 Security

- Least-privilege service tokens; secrets in a vault.
- Webhook signature verification; PCI scope minimized (tokenized via Stripe).
- Per-tenant encryption context; audit log immutable.
- DPIA for biometric/selfie processing; no facial recognition / identification use.
