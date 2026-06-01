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

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/api/v1/services` | List active services |
| GET  | `/api/v1/staff` | List active staff |
| GET  | `/api/v1/availability?serviceId&staffId&date` | Free slots + dynamic price |
| GET  | `/api/v1/bookings` | List bookings |
| POST | `/api/v1/bookings` | Create a booking |
| PATCH| `/api/v1/bookings/{id}/status` | Update booking status |

All requests are tenant-scoped via the `X-Tenant-Id` header (falls back to the
seed demo salon `11111111-1111-1111-1111-111111111111`).

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
api/         REST controllers + DTOs
service/     Application services (catalog, availability, booking)
pricing/     Dynamic Pricing engine (rules-based "lite")
domain/      JPA entities
repo/        Spring Data repositories
tenant/      Multi-tenant request context + filter
common/      Error handling
config/      CORS, properties
resources/db/migration  Flyway schema + seed
```

## Next steps (per `docs/`)
- AuthN/AuthZ (OIDC/JWT) → derive tenant from token, add RLS on PostgreSQL.
- Payments (Stripe), reminders (WhatsApp/Email), waitlist automation.
- AI engines: Hairstyle Preview, ML Dynamic Pricing, Inventory Prediction, Receptionist.
