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
| POST | `/api/v1/auth/login` | public | Sign in, returns JWT |
| GET  | `/api/v1/auth/me` | **bearer** | Current user |
| GET  | `/api/v1/services` | public | List active services |
| GET  | `/api/v1/staff` | public | List active staff |
| GET  | `/api/v1/availability?serviceId&staffId&date` | public | Free slots + dynamic price |
| POST | `/api/v1/bookings` | public | Create a booking (customer flow) |
| GET  | `/api/v1/bookings` | **bearer** | List bookings (dashboard) |
| PATCH| `/api/v1/bookings/{id}/status` | **bearer** | Update booking status |

**Tenancy:** authenticated requests derive the tenant from the JWT. Public
requests use the `X-Tenant-Id` header, falling back to the seed demo salon
`11111111-1111-1111-1111-111111111111`.

**Demo login:** `owner@demo.barbarizoo` / `password123` (seeded on first start).

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
api/         REST controllers + DTOs (catalog, availability, booking)
auth/        Login/me controller + service + DTOs
security/    JWT issue/verify, auth filter, Spring Security config
service/     Application services (catalog, availability, booking)
pricing/     Dynamic Pricing engine (rules-based "lite")
domain/      JPA entities (incl. AppUser)
repo/        Spring Data repositories
tenant/      Multi-tenant request context
common/      Error handling
config/      Properties + demo data seeder
resources/db/migration  Flyway schema + seed (V1 core, V2 auth)
```

## Next steps (per `docs/`)
- Role-based authorization rules, refresh tokens, add RLS on PostgreSQL.
- Payments (Stripe), reminders (WhatsApp/Email), waitlist automation.
- AI engines: Hairstyle Preview, ML Dynamic Pricing, Inventory Prediction, Receptionist.
