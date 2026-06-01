# 9 · 12-Month Product Roadmap

Four quarters from foundation to AI-native differentiation and chain readiness. Dates relative to project start (T0).

## Q1 (Months 1–3) — Foundation & MVP build

**Theme: a salon can run its whole booking + payment day on Barbarizoo.**

- Multi-tenant platform, auth, roles, GDPR consent framework.
- Booking core: services, staff, working hours, calendar, lifecycle.
- Payments: Stripe (cards/Klarna/SEPA), deposits, basic POS.
- Reminders (Email + WhatsApp), basic waitlist.
- Rules-based dynamic pricing (lite); manual inventory + threshold alerts.
- **AI Hairstyle Preview v1** (curated presets, before/after, recommendations).
- Core CRM + daily revenue report; DE/EN; WCAG AA on booking.
- Compliance: VAT on receipts, EU residency, ephemeral image handling, DPIA.

**Exit:** private beta with 5–10 friendly salons.

## Q2 (Months 4–6) — MVP launch & conversion proof

**Theme: prove Hairstyle Preview lifts bookings; reach 20–30 paying salons.**

- Public MVP launch in Berlin/Hamburg; founding-partner program.
- Hairstyle Preview polish + "Book this style" upsell mapping; measure lift.
- PayPal, gift cards, memberships, loyalty & referral v1.
- Waitlist automation (auto-offer freed slots).
- Reporting: staff performance, weekly forecast, CSV/PDF export.
- Arabic / RTL UI; accessibility audit.
- Instrumentation for north-star (revenue/chair) + experiment framework.

**Exit:** ≥ +15% preview→booking lift; 20–30 paying salons; NPS ≥ 40.

## Q3 (Months 7–9) — AI engines go ML

**Theme: monetizable AI — pricing & inventory that make/save money.**

- **Dynamic Pricing ML:** demand forecasting + elasticity, human-in-the-loop recommendations, revenue simulation dashboard.
- **Smart Inventory Prediction ML:** booking-driven depletion, reorder suggestions, supplier management, Inventory Health Score.
- **AI Receptionist (text)**: WhatsApp/IG/web chat — book, reschedule, price, FAQ, upsell, human handoff; per-tenant RAG.
- DATEV/lexoffice export; advanced P&L dashboard.
- Launch **Growth** & **AI Suite** tiers.

**Exit:** measurable revenue/chair uplift on Growth salons; receptionist automating ≥ 50% of text conversations.

## Q4 (Months 10–12) — Voice, chains & scale

**Theme: AI Receptionist voice, multi-location, scale & expansion prep.**

- **AI Receptionist Voice AI** (phone answering, booking, handoff).
- Multi-location / chain dashboards: central P&L, pricing governance, role hierarchy, SSO.
- Native customer apps (iOS/Android) or PWA hardening.
- Marketplace/discovery experiment (consumer acquisition loop).
- Performance, cost optimization (AI metering), reliability hardening (99.9%).
- Prepare EU expansion (multi-currency, localization framework, AT/CH next).

**Exit:** chain pilots live; voice receptionist in production; expansion playbook ready.

## Milestone summary

| Quarter | Headline | Key metric |
|---------|----------|-----------|
| Q1 | MVP built | Private beta live |
| Q2 | Launch + conversion proof | +15% preview→booking lift, 20–30 salons |
| Q3 | ML pricing + inventory + text receptionist | Revenue/chair uplift |
| Q4 | Voice receptionist + chains | Chain pilots, voice in prod |

## Sequencing rationale

- **Booking/payments first** — without the daily-driver workflow, no AI matters.
- **Hairstyle Preview early** — cheapest, most viral, conversion-driving differentiator; also seeds data.
- **Pricing & inventory ML mid-year** — need accumulated booking data to train; these justify higher tiers.
- **Voice receptionist last** — highest complexity/cost; benefits from mature booking + RAG foundation.
