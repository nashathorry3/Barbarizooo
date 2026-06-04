# Barbarizoo Backend (Spring Boot)

Java 21 · Spring Boot 3.4 · Spring Data JPA · Flyway · H2 (dev) / PostgreSQL (prod).

Implements the **booking-core vertical slice** of the Barbarizoo platform:
service catalog, staff, availability with dynamic pricing, and bookings — all
multi-tenant.

## Run

```bash
mvn spring-boot:run
# API at http://localhost:8080 ; H2 console at /h2-console
```

Runs on in-memory H2 (seeded via Flyway) by default. For PostgreSQL:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
# configurable via DB_URL / DB_USER / DB_PASSWORD env vars
```

## API

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/auth/login` | public | Sign in with email + password, returns JWT |
| POST | `/api/v1/auth/google` | public | Sign in / sign up with a Google ID token |
| GET  | `/api/v1/auth/me` | **bearer** | Current user |
| GET  | `/api/v1/salons/{ref}` | public | Resolve a salon by slug or id (for its booking page) |
| GET  | `/api/v1/services` | public | List active services |
| GET  | `/api/v1/staff` | public | List active staff |
| GET  | `/api/v1/availability?serviceId&staffId&date` | public | Free slots + dynamic price |
| POST | `/api/v1/services` | **OWNER/MANAGER** | Create a service |
| DELETE | `/api/v1/services/{id}` | **OWNER/MANAGER** | Deactivate a service |
| GET  | `/api/v1/users` | **OWNER/MANAGER** | List staff accounts |
| POST | `/api/v1/users` | **OWNER** | Create a staff account |
| POST | `/api/v1/bookings` | public | Create a booking (customer flow) |
| GET  | `/api/v1/bookings` | **bearer** | List bookings (dashboard) |
| PATCH| `/api/v1/bookings/{id}/status` | **bearer** | Update booking status |
| POST | `/api/v1/payments/deposit` | public | Start a deposit for a booking |
| POST | `/api/v1/payments/deposit/{ref}/confirm` | public | Confirm the deposit (PSP webhook in prod) |
| GET  | `/api/v1/payments` | **OWNER/MANAGER** | List payments |
| GET  | `/api/v1/reminders` | **OWNER/MANAGER** | List scheduled/sent reminders |
| POST | `/api/v1/reminders/dispatch` | **OWNER** | Send due reminders now |
| POST | `/api/v1/studio/session` | public | Start a (consent-gated) preview session |
| GET  | `/api/v1/studio/recommendations?faceShape&gender` | public | Ranked hairstyle suggestions |
| POST | `/api/v1/studio/preview` | public | Preview a style (rendering stubbed) |

**Booking ↔ deposit:** with `require-deposit=true` a booking is `PENDING` until the
deposit is confirmed, then `CONFIRMED` (which schedules its reminders).
**Reminders:** a `ReminderScheduler` dispatches due items every 30s via a
`NotificationSender` (simulated; swap in WhatsApp/Email/SMS).
**AI Hairstyle Preview:** the recommendation ranking is real; photo-realistic
try-on is stubbed (`SIMULATED`) pending a GPU vision model.

**Roles:** `OWNER` > `MANAGER` > `STAFF`, carried in the JWT and enforced with
`@PreAuthorize`. **Payments:** a `simulated` gateway is the default
(`barbarizoo.payments.provider`); deposit size is `barbarizoo.payments.deposit-percent`
(default 30%). A Stripe gateway can be dropped in behind the `PaymentGateway` interface.

**Tenancy:** authenticated requests derive the tenant from the JWT. Public
requests use the `X-Tenant-Id` header, falling back to the seed demo salon
`11111111-1111-1111-1111-111111111111`.

**Demo login:** `owner@demo.barbarizoo` / `password123` (seeded on first start).

**Google sign-in / salon sign-up:** controlled by `barbarizoo.google.mode`. Default
`mock` accepts a `mock|email|name|sub` token (so the flow is testable without Google).
Set `GOOGLE_AUTH_MODE=real` + `GOOGLE_CLIENT_ID` to verify real Google ID tokens.
**First-time Google sign-up provisions a brand-new salon (tenant)** with the user as
`OWNER` and seeds a starter setup (owner-as-stylist + Haircut/Beard Trim services), so
salon onboarding is a single click. Returning users simply sign in to their salon.

```bash
TOKEN=$(curl -s -X POST localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@demo.barbarizoo","password":"password123"}' \
  | sed -E 's/.*"token":"([^"]+)".*/\1/')
curl -s localhost:8080/api/v1/bookings -H "Authorization: Bearer $TOKEN"
```

### Example

```bash
curl "http://localhost:8080/api/v1/services"

curl -X POST http://localhost:8080/api/v1/bookings \
  -H 'Content-Type: application/json' \
  -d '{"serviceId":"33333333-0000-0000-0000-000000000001",
       "staffId":"22222222-0000-0000-0000-000000000001",
       "startsAt":"2026-06-04T10:00:00",
       "customerName":"Jonas","customerEmail":"jonas@example.de",
       "marketingConsent":true}'
```

## Layout

```
api/           REST controllers + DTOs (catalog, availability, booking)
auth/          Login/me + user management controllers, services, DTOs
security/      JWT issue/verify, auth filter, Spring Security config (RBAC)
payments/      Provider-agnostic gateway + simulated impl, service, controller
notifications/ Reminder scheduling + dispatch, NotificationSender (simulated)
studio/        AI Hairstyle Preview: recommendation engine + (stubbed) preview
pricing/       Dynamic Pricing engine (rules-based "lite")
domain/        JPA entities (AppUser, Payment, Reminder, Hairstyle, ...)
repo/          Spring Data repositories
tenant/        Multi-tenant request context
common/        Error handling
config/        Properties + demo data seeder
resources/db/migration  Flyway (V1 core, V2 auth, V3 payments, V4 reminders, V5 hairstyle)
```

## Next steps (per `docs/`)
- Real Stripe gateway + GPU vision model behind their interfaces; refresh tokens; RLS.
- Waitlist automation; ML Dynamic Pricing; Inventory Prediction; AI Receptionist.
