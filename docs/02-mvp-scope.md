# 2 · MVP Scope

The MVP must prove two things: (1) salons will switch their booking to Barbarizoo, and (2) the **AI Hairstyle Preview** measurably lifts booking conversion. Everything else is sequenced behind those bets.

## 2.1 Guiding principle

> Ship the smallest product that lets a single barbershop run its **entire booking + payment day** on Barbarizoo, plus **one** flagship AI wedge (Hairstyle Preview). Other AI engines ship as "lite" heuristics first and become ML-driven post-MVP.

## 2.2 In scope (MVP — months 0–4)

### Booking & calendar
- Online booking page + embeddable widget + link-in-bio.
- Service catalog, staff, working hours, breaks, time-off.
- Drag-and-drop calendar (day/week views), multi-staff.
- Booking lifecycle: create / confirm / reschedule / cancel / no-show.
- Automated reminders: **Email + WhatsApp** (SMS as paid add-on).
- Basic waitlist (manual offer to next in line).

### Payments
- **Stripe** as primary (cards, Klarna, SEPA via Stripe), with deposits & no-show fees.
- Refunds, partial deposits, basic POS for walk-ins.
- *(PayPal & native SEPA mandate management deferred to Phase 2.)*

### AI Hairstyle Preview (flagship)
- Selfie upload + face detection.
- Try-on of a **curated set** of haircuts and beard styles (10–15 presets) + color shift.
- Before/After slider; "Book this style" deep-link.
- GDPR consent + auto-deletion of source images.

### Dynamic Pricing — **rules-based "lite"**
- Owner-defined off-peak / peak / last-minute rules (no ML yet).
- Price preview on the booking page.

### Inventory — **manual + threshold alerts**
- Product list, stock counts, low-stock alerts (threshold-based).
- *(Predictive ML deferred.)*

### CRM & reporting (core)
- Customer profiles + history + notes.
- Daily/weekly revenue summary; CSV export.

### Compliance (non-negotiable from day 1)
- GDPR consent flows, EU data residency, data-deletion.
- German VAT on receipts; DE/EN languages (AR added Phase 2).
- WCAG 2.2 AA on booking flow.

### Platform
- Multi-tenant (one salon = one tenant), owner + staff roles.
- Owner web dashboard + mobile-responsive customer booking.

## 2.3 Out of scope for MVP (deferred)

| Feature | Phase |
|---------|-------|
| ML Dynamic Pricing (demand forecasting) | Phase 2 |
| ML Inventory Prediction + auto-reorder | Phase 2 |
| AI Salon Receptionist (chat) | Phase 2 |
| AI Receptionist **Voice AI** (phone) | Phase 3 |
| Instagram/WhatsApp inbox automation | Phase 2 |
| Memberships, gift cards, referrals, loyalty | Phase 2 |
| Multi-location / chain dashboards | Phase 3 |
| Native iOS/Android apps (customer) | Phase 2–3 |
| Arabic / RTL UI | Phase 2 |
| DATEV export, advanced P&L | Phase 2 |
| Marketplace / discovery | Phase 3 |

## 2.4 MVP success metrics (exit criteria)

| Metric | Target |
|--------|--------|
| Pilot salons live | 20–30 in Berlin/Hamburg |
| Booking conversion (visit→booking) | ≥ 35% |
| **Hairstyle Preview → booking lift** | ≥ +15% vs. non-preview sessions |
| No-show rate (with deposits) | ≤ 5% |
| Owner weekly active usage | ≥ 80% of pilots |
| NPS (owners) | ≥ 40 |

## 2.5 MVP team shape (lean)

- 1 product/founder, 1 designer, 2 full-stack, 1 ML engineer (Hairstyle Preview), 0.5 DevOps, 0.5 compliance/legal advisor.

## 2.6 Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Hairstyle AI looks "uncanny" → erodes trust | Curated presets + quality gate; human-review sample; clearly label as preview |
| GDPR misstep on biometric selfies | DPIA before launch; ephemeral images; explicit consent; no biometric identification |
| Salons resist switching | Free migration of client list + 3-month founding-partner pricing |
| WhatsApp API approval delays | Email reminders as fallback from day 1 |
