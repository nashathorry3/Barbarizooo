# Barbarizoo — BeautyTech SaaS for Germany 🇩🇪✂️

> **All-in-one operating system for barbers, hairdressers, and salons** — built for the German market, designed to scale across Europe.

Barbarizoo is a startup-grade SaaS platform that combines **smart booking & payments**, an **AI Hairstyle Preview studio**, a **Dynamic Pricing Engine**, **Smart Inventory Prediction**, a full **CRM + analytics suite**, and an **AI Salon Receptionist** — built from day one for **GDPR**, German tax rules, accessibility, and multi-language (DE / EN / AR) support.

The goal: a product that is **stronger than Fresha, Treatwell, Shore, and Planity** by leaning into AI-native differentiation.

---

## 🧱 Repository structure

```
.
├── backend/      Spring Boot (Java 21) REST API — booking core + owner-set pricing
├── frontend/     Next.js (TypeScript, Tailwind) — customer booking + owner dashboard
└── docs/         Full product blueprint (10 deliverables, see below)
```

## 🚀 Running the application

**Backend** (Java 21 + Maven) — runs on in-memory H2 with seed data, zero setup:

```bash
cd backend
mvn spring-boot:run          # → http://localhost:8080
# Persistent local DB (your data survives restarts — no Postgres needed):
# mvn spring-boot:run -Dspring-boot.run.profiles=local
# Production-like Postgres instead of H2:
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

### 🧑‍💼 Use it for real (as a salon owner)

The whole flow is self-service — onboard your own salon and take live bookings:

1. **Run the backend with a persistent DB** so your data survives restarts:
   `mvn spring-boot:run -Dspring-boot.run.profiles=local` (file-based H2 in
   `backend/data/`), or the full Postgres stack via `docker compose up -d --build`.
2. **Sign up** at `http://localhost:3000/signup` → *Continue with Google* (demo
   mode lets you enter any email — no Google account needed locally). This
   **provisions your own salon** with you as OWNER plus a starter setup.
3. **Set up your salon** in the dashboard: add your real services, prices, and
   stylists. Your salon gets a public link at `http://localhost:3000/book/{your-slug}`.
4. **Share that booking link** with customers — bookings, deposits, and reminders
   flow into your dashboard. Flip on real Stripe/email/Google when you go live
   (see `DEPLOY.md`).

### Implemented in this MVP slice
- **Authentication & one-click salon sign-up** — JWT login (`POST /api/v1/auth/login`,
  `GET /api/v1/auth/me`) **plus Sign in / Sign up with Google** (`POST /api/v1/auth/google`).
  A first-time Google sign-up **provisions a new salon (tenant) with the user as OWNER** and
  seeds a starter setup, so salons onboard in one click. The backend verifies the Google ID
  token and issues an app JWT; a `mock` verifier (default) makes this testable locally, set
  `GOOGLE_AUTH_MODE=real` + `GOOGLE_CLIENT_ID` for production. Dashboard requires sign-in; the
  customer booking flow stays public. Demo: `owner@demo.barbarizoo` / `password123`.
- **Role-based access control (RBAC)** — `OWNER` / `MANAGER` / `STAFF`. Managing the service
  catalog (`POST`/`DELETE /api/v1/services`) is owner/manager-only; user management
  (`GET`/`POST /api/v1/users`) is owner-only for create. Enforced via `@PreAuthorize`.
- **Payments (deposits) — real Stripe or simulated** — provider-agnostic gateway. The default
  `simulated` mode works with zero setup; set `PAYMENTS_PROVIDER=stripe` + `STRIPE_SECRET_KEY`
  (backend) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (frontend) to collect real cards via Stripe.js
  Payment Element, confirmed by a signature-verified Stripe webhook. Customer takes a deposit
  (`POST /api/v1/payments/deposit` + `/confirm`); owners/managers see payments. A new booking is
  held **PENDING** until the deposit is paid, then promoted to **CONFIRMED**.
- **Reminders** — on confirmation, a confirmation + 24h + 2h pre-visit reminder are scheduled
  (Email/WhatsApp) and dispatched by a scheduler (or `POST /api/v1/reminders/dispatch`). A
  channel-agnostic `NotificationSender` (simulated) is swappable for real WhatsApp/Email/SMS.
- **AI Hairstyle Preview** — consent-gated session, a real recommendation engine ranking styles
  by face shape + gender + German trend score (`GET /api/v1/studio/recommendations`), and a
  "Book this look" deep link. Photo-realistic rendering is intentionally **stubbed** (returns a
  clearly-labeled SIMULATED status) since it needs a GPU vision model.
- **Per-salon public booking links** — every salon gets a unique slug and a shareable link
  `…/book/{slug}` (resolve via `GET /api/v1/salons/{ref}`). The booking page is tenant-aware, so
  each salon's customers see only that salon's services, staff, and prices. Owners copy their link
  from the dashboard (for Instagram bio, WhatsApp, QR codes).
- **Salon self-management (dashboard)** — owners customize their booking-link slug + salon name
  (`PATCH /api/v1/salons`, with normalization + uniqueness checks) and owners/managers add or
  remove services, all from the dashboard.
- **Staff management (dashboard)** — owners/managers add stylists with display name, role
  (STYLIST/BARBER/COLORIST/RECEPTIONIST), seniority (JUNIOR/MID/SENIOR/MASTER), and color;
  deactivate staff; and configure which stylists are assignable to each service via
  `POST /api/v1/staff`, `DELETE /api/v1/staff/{id}`, and `PUT /api/v1/services/{id}/staff`.
- **Owner-controlled pricing** — each service has a single fixed price set by the salon owner,
  editable any time from the dashboard (`PATCH /api/v1/services/{id}`). No demand-based surcharges.
- Service catalog & staff (`GET /api/v1/services`, `/staff`)
- Availability at the salon's fixed per-service price (`GET /api/v1/availability`)
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
