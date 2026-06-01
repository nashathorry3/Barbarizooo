# 1 · Full SaaS Product Blueprint

## 1.1 Vision

**Barbarizoo** is the AI-native operating system for the beauty and grooming industry, launching in Germany. Where incumbents (Fresha, Treatwell, Shore, Planity) treat booking as the product, Barbarizoo treats booking as the *entry point* and wraps it in four AI engines that grow revenue per chair: **visual conversion (Hairstyle Preview)**, **yield management (Dynamic Pricing)**, **operational efficiency (Inventory Prediction)**, and **front-desk automation (AI Receptionist)**.

> **One-line positioning:** "The salon platform that fills your chairs, prices them intelligently, and runs your front desk — automatically."

## 1.2 Target market

| Segment | Description | Priority |
|---------|-------------|----------|
| Independent barbers | 1–3 chairs, owner-operated, mobile-first | **MVP core** |
| Hair & beauty salons | 4–15 staff, multi-service | **MVP core** |
| Barbershop chains / franchises | Multi-location, central reporting | Phase 2 |
| Beauty franchises across EU | Multi-country, multi-currency | Phase 3 |

**Beachhead:** independent barbershops in German metros (Berlin, Hamburg, München, Köln, Frankfurt) — a young, trend-driven, Instagram-active segment where the AI Hairstyle Preview is a wedge no competitor offers.

## 1.3 Personas

- **Mehmet — the shop owner.** Runs a 3-chair barbershop. Cares about no-shows, idle Tuesday mornings, and whether his beard-oil stock will last the weekend. Wants the business to run when he's cutting hair.
- **Lena — the stylist/employee.** Cares about a clean schedule, fair tip/commission visibility, and not being interrupted by phone calls.
- **Jonas — the customer.** Books at 11pm from Instagram. Unsure about a new fade. Wants to *see* it before committing and to pay deposit in two taps.
- **Sofia — the regional manager (chain).** Cares about per-location P&L, staff performance, and consistent pricing strategy across shops.

## 1.4 Feature map

### Pillar 1 — Smart Booking & Payments
- 24/7 online booking (web, embeddable widget, link-in-bio, native app).
- Calendar management: drag-and-drop, resource/room/chair assignment, working hours, breaks, holidays.
- Multi-staff booking; group/family bookings; service add-ons.
- **Automated reminders** via WhatsApp / SMS / Email with confirm/cancel/reschedule links.
- **Waitlist automation** — auto-offer freed slots to waitlisted clients by priority.
- Payments: **Stripe, PayPal, Klarna, SEPA Direct Debit**.
- **Deposits** & no-show protection, **memberships/subscriptions**, **gift cards**, **POS** for walk-ins and product sales.

### Pillar 2 — AI Hairstyle Preview
- Selfie upload + live camera.
- Try-on of haircuts, hair color, and beard styles.
- Realistic **Before / After** comparison.
- Recommendation by **face shape, skin tone, gender, age, German trends**.
- One-tap "Book this style" → pre-fills the matching service.

### Pillar 3 — Dynamic Pricing Engine
- Demand-aware pricing: peak hours, occupancy, season, weekday, local events, stylist seniority.
- Scenarios: off-peak discounts, peak surcharge, last-minute deals, VIP pricing, loyalty discounts.
- Demand forecasting, revenue optimization, price-recommendation engine.
- Owner dashboard: price→revenue impact, performance comparison, what-if simulation.

### Pillar 4 — Smart Inventory Prediction
- Real-time stock tracking (oils, shampoos, color, blades, etc.).
- Stock-out forecasting, auto-reorder suggestions, consumption analytics.
- Supplier management, low-stock alerts.
- Dashboard: **Inventory Health Score**, cost forecasting, waste-reduction metrics.

### Pillar 5 — CRM + Reports
- Customer profiles (history, photos, preferences, notes, allergies).
- Loyalty program + referral system.
- Monthly reports, revenue forecast, employee performance.
- Profit & Loss dashboard; PDF / Excel export.

### Pillar 6 — Germany Compliance
- GDPR, German tax rules (VAT, GoBD, DATEV), multi-language (DE/EN/AR), WCAG 2.2 AA accessibility.

### Differentiator — AI Salon Receptionist
- Omnichannel: WhatsApp, Instagram DM, website chat, phone (Voice AI).
- Actions: book, reschedule, quote prices, recommend services, upsell.
- Hands off to a human when confidence is low.

## 1.5 Value proposition by stakeholder

| Stakeholder | Pain today | Barbarizoo value |
|-------------|-----------|------------------|
| Owner | No-shows, idle slots, manual stock, phone interruptions | Deposits + waitlist, dynamic pricing fills idle slots, AI reorder, AI receptionist |
| Stylist | Chaotic schedule, unclear earnings | Clean calendar, performance & commission view |
| Customer | Uncertainty before a new look, slow booking | Visual try-on, 2-tap booking, instant answers |
| Chain manager | No cross-location visibility | Central P&L, staff benchmarking, pricing governance |

## 1.6 Business model summary

- **Primary:** monthly SaaS subscription per location (tiered) — see [Pricing Strategy](07-pricing-strategy.md).
- **Secondary:** payment processing margin, paid SMS/WhatsApp credits, AI Hairstyle Preview usage on higher tiers, marketplace lead-gen (Phase 3).
- **Expansion:** add-on modules (AI Receptionist voice minutes, advanced analytics, multi-location).

## 1.7 North-star metric

**Revenue per chair per month**, attributed across the platform — the metric that proves Barbarizoo makes salons money rather than just scheduling them. Supporting KPIs: booking conversion rate, no-show rate, off-peak utilization, average ticket value, inventory waste %.
