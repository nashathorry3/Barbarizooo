# Barbarizoo — BeautyTech SaaS for Germany 🇩🇪✂️

> **All-in-one operating system for barbers, hairdressers, and salons** — built for the German market, designed to scale across Europe.

Barbarizoo is a startup-grade SaaS platform that combines **smart booking & payments**, an **AI Hairstyle Preview studio**, a **Dynamic Pricing Engine**, **Smart Inventory Prediction**, a full **CRM + analytics suite**, and an **AI Salon Receptionist** — built from day one for **GDPR**, German tax rules, accessibility, and multi-language (DE / EN / AR) support.

The goal: a product that is **stronger than Fresha, Treatwell, Shore, and Planity** by leaning into AI-native differentiation.

---

## 🧱 Repository structure

```
.
├── backend/      Spring Boot (Java 21) REST API — booking core + dynamic pricing
├── frontend/     Next.js (TypeScript, Tailwind) — customer booking + owner dashboard
└── docs/         Full product blueprint (10 deliverables, see below)
```

## 🚀 Running the application

**Backend** (Java 21 + Maven) — runs on in-memory H2 with seed data, zero setup:

```bash
cd backend
mvn spring-boot:run          # → http://localhost:8080
# Postgres instead of H2:
# mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

**Frontend** (Node 20+):

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                   # → http://localhost:3000
```

Open `http://localhost:3000` to book an appointment and `http://localhost:3000/dashboard`
to manage bookings. The seed salon ("Barbarizoo Demo Barbershop Berlin") comes with
services and two stylists. Prices shift with demand via the rules-based Dynamic Pricing engine.

### Implemented in this MVP slice
- **Authentication** — JWT login (`POST /api/v1/auth/login`, `GET /api/v1/auth/me`); the
  dashboard requires sign-in while the customer booking flow stays public. Demo account:
  `owner@demo.barbarizoo` / `password123`.
- **Role-based access control (RBAC)** — `OWNER` / `MANAGER` / `STAFF`. Managing the service
  catalog (`POST`/`DELETE /api/v1/services`) is owner/manager-only; user management
  (`GET`/`POST /api/v1/users`) is owner-only for create. Enforced via `@PreAuthorize`.
- **Payments (deposits)** — provider-agnostic gateway with a simulated implementation
  (swappable for Stripe). Customer takes a deposit (`POST /api/v1/payments/deposit` +
  `/confirm`); owners/managers see payments (`GET /api/v1/payments`). Deposit % is configurable.
- Service catalog & staff (`GET /api/v1/services`, `/staff`)
- Availability with per-slot dynamic pricing (`GET /api/v1/availability`)
- Booking create / list / status update (`/api/v1/bookings`) with no-double-booking enforcement
- Multi-tenancy: tenant derived from the JWT for authenticated requests, `X-Tenant-Id` for the
  public flow; Flyway migrations, BCrypt password hashing, GDPR consent capture, validation & error envelope

> The four AI engines and remaining modules are specified in `docs/` and stubbed for
> follow-up implementation; this slice delivers the runnable booking + pricing core.

## 📦 Product blueprint

This repository also holds the **full product blueprint** — the architecture, scope, design, and roadmap needed to build Barbarizoo. Each document maps to a deliverable.

| # | Document | Description |
|---|----------|-------------|
| 1 | [Product Blueprint](docs/01-product-blueprint.md) | Vision, personas, full feature map, value proposition |
| 2 | [MVP Scope](docs/02-mvp-scope.md) | What ships first, what is deferred, success metrics |
| 3 | [UX / UI Flow](docs/03-ux-ui-flow.md) | Customer, staff, and owner journeys + key screens |
| 4 | [Database Design](docs/04-database-design.md) | ERD, core tables, multi-tenancy, data model |
| 5 | [API Architecture](docs/05-api-architecture.md) | Services, REST/GraphQL surface, events, integrations |
| 6 | [AI Models Architecture](docs/06-ai-models-architecture.md) | Hairstyle Preview, Dynamic Pricing, Inventory, Receptionist |
| 7 | [Pricing Strategy](docs/07-pricing-strategy.md) | SaaS subscription tiers + go-to-market pricing |
| 8 | [Competitive Advantage](docs/08-competitive-advantage.md) | Comparison vs Fresha / Treatwell / Shore / Planity |
| 9 | [12-Month Roadmap](docs/09-roadmap-12-months.md) | Quarter-by-quarter build & launch plan |
| 10 | [Tech Stack](docs/10-tech-stack.md) | Recommended technologies and rationale |

---

## 🌟 The five pillars

1. **Smart Booking & Payments** — 24/7 online booking, calendar & multi-staff management, automated WhatsApp/SMS/Email reminders, waitlist automation, deposits, memberships, gift cards, and POS — paid via Stripe, PayPal, Klarna, and SEPA.
2. **AI Hairstyle Preview** — customers upload a selfie and try on haircuts, colors, and beard styles with realistic before/after, plus AI style recommendations based on face shape, skin tone, gender, age, and German trends.
3. **Dynamic Pricing Engine** — demand-aware pricing across peak hours, occupancy, season, weekday, local events, and stylist seniority — with last-minute deals, VIP and loyalty pricing, and a revenue-simulation dashboard.
4. **Smart Inventory Prediction** — real-time stock tracking for oils and hair products, AI stock-out forecasting, auto-reorder suggestions, supplier management, and an Inventory Health Score.
5. **AI Salon Receptionist** — an always-on assistant that answers WhatsApp, Instagram, website chat, and phone calls (Voice AI) to book, reschedule, quote prices, suggest services, and upsell automatically.

---

## 🇩🇪 Germany-first compliance

- **GDPR** by design — consent, data minimization, right-to-erasure, EU data residency.
- **German tax** — correct VAT (USt. 19% / 7%), GoBD-compliant records, DATEV export.
- **Multi-language** — German, English, Arabic (RTL-ready).
- **Accessibility** — WCAG 2.2 AA, BITV 2.0 alignment.

---

## 🧭 How to read this blueprint

Start with the [Product Blueprint](docs/01-product-blueprint.md) for the big picture, then the [MVP Scope](docs/02-mvp-scope.md) to see what gets built first. Engineers should focus on docs 4–6 and 10; founders/PMs on docs 1, 2, 7–9.

---

*This is a living design document. Architecture decisions here are recommendations intended to be challenged and refined during implementation.*
