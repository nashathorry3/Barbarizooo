# 7 · Pricing Strategy (SaaS Monetization)

> Distinct from the in-product *Dynamic Pricing Engine* (doc 6). This is how **Barbarizoo charges salons**.

## 7.1 Principles

- **Land with low friction, expand with AI value.** Core booking is affordable; the AI engines (Preview, Pricing, Receptionist) drive upgrades.
- **Per-location subscription** + usage for messaging/AI/voice + payment margin.
- **Anchored to ROI**, not seat count — a salon that fills 3 extra off-peak slots/week pays for itself.
- **Transparent, EU-friendly** (prices incl./excl. VAT clearly; monthly or annual −20%).

## 7.2 Subscription tiers (per location / month)

| Tier | Price (indicative) | For | Highlights |
|------|--------------------|-----|------------|
| **Starter** | €0–19 | Solo barbers testing | Online booking, calendar, email reminders, 1 staff, Stripe payments. (Free tier offsets via payment margin.) |
| **Pro** | €49 | Independent shops | Multi-staff, WhatsApp reminders, deposits, waitlist, **rules-based dynamic pricing**, basic CRM & reports, **AI Hairstyle Preview (limited credits)** |
| **Growth** | €99 | Established salons | Everything in Pro + **ML Dynamic Pricing**, **Smart Inventory Prediction**, loyalty/referrals, memberships & gift cards, full reports + P&L, more Preview credits |
| **AI Suite** | €179+ | Ambitious / premium | Everything + **AI Receptionist (text)**, advanced analytics, priority support; **Voice AI** as add-on |
| **Chains** | Custom | Multi-location/franchise | Central P&L, role governance, pricing policy, SSO, account manager |

*Numbers are go-to-market hypotheses to validate against willingness-to-pay and competitor anchors (Shore/Treatwell ~€50–150/mo range).*

## 7.3 Usage-based add-ons

| Add-on | Model |
|--------|-------|
| WhatsApp / SMS credits | Per-message bundles (pass-through + margin) |
| AI Hairstyle Preview | Included credits per tier; overage per-generation |
| AI Receptionist Voice minutes | Per-minute (telephony + AI cost + margin) |
| Payment processing | % + fixed per transaction (Stripe markup) |
| Extra staff seats | Per-seat above tier cap |

## 7.4 Packaging logic

- **Hairstyle Preview** seeded in Pro (cheap, viral, conversion-driving) → drives word-of-mouth and trials.
- **Inventory + ML Pricing** gated at Growth — these *save/earn money*, justifying the jump.
- **Receptionist** gated at AI Suite — highest-value automation, replaces front-desk labor.

## 7.5 Go-to-market pricing tactics

- **Founding partner program:** first 100 salons get Growth at Pro price for 12 months + free data migration.
- **No-risk migration:** import existing client list + bookings free.
- **Annual −20%** to improve cash & retention.
- **ROI calculator** at signup ("fill 3 off-peak slots/week = €X/mo > subscription").
- **Referral:** salon refers salon → 1 month free both sides.

## 7.6 Unit economics targets

| Metric | Target |
|--------|--------|
| Blended ARPA | €80–110 / location / mo |
| Gross margin | ≥ 75% (AI cost controlled via caching/batching) |
| CAC payback | < 6 months |
| Net revenue retention | ≥ 115% (add-ons + tier upgrades) |
| Logo churn (monthly) | < 2.5% |

## 7.7 Pricing risks

- AI inference cost erodes margin → meter per-tenant, cache aggressively, batch, right-size GPU.
- Free tier abuse → cap features, rely on payment-margin monetization.
- Competitor "free" booking (Fresha) → compete on AI ROI + German-specific compliance/support, not on being cheapest.
