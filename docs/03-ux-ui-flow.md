# 3 · UX / UI Flow

Three primary surfaces: **Customer booking** (mobile-first), **Staff app** (calendar-centric), **Owner dashboard** (management & analytics). Plus the **AI Receptionist** conversational surface.

## 3.1 Design principles

- **Mobile-first, thumb-reach.** Customers book from phones, often from Instagram.
- **Two-tap booking.** Minimize steps from intent to confirmed slot.
- **AI as confidence, not gimmick.** Hairstyle Preview reduces hesitation; it must feel premium and fast.
- **Calm by default for owners.** Dashboards surface the *one thing to act on* (e.g., "Beard oil runs out in 9 days — reorder").
- **Accessible & multilingual.** WCAG 2.2 AA, DE/EN/AR with RTL.

## 3.2 Customer booking journey

```
Discover (IG link / QR / website)
        │
        ▼
  Salon landing  ──▶  Browse services & prices (dynamic price shown)
        │
        ▼
  [Optional] AI Hairstyle Preview
     • Upload selfie / open camera
     • Pick style + color  → Before/After slider
     • "Book this style" (pre-fills service)
        │
        ▼
  Choose service ▶ staff (or "any") ▶ date/time slot
        │
        ▼
  Login / guest (email or phone OTP)
        │
        ▼
  Pay deposit (Stripe: card / Klarna / SEPA)
        │
        ▼
  Confirmation + add-to-calendar + WhatsApp/Email reminder scheduled
        │
        ▼
  Reminder (24h & 2h) ▶ confirm / reschedule / cancel links
```

**Waitlist flow:** if no slot fits, "Join waitlist" → auto-notified when a matching slot frees, with a time-boxed claim link.

## 3.3 Staff app journey

```
Login ▶ Today's calendar (agenda)
   • Drag to reschedule, tap to view client (history, photos, notes, preferences)
   • Check-in ▶ in-progress ▶ checkout (add products, tip, POS payment)
   • Block time / break
   • Notifications: new booking, cancellation, waitlist claimed
```

Key screens: Today agenda, Client card, Checkout/POS, My performance (bookings, revenue, tips, commission).

## 3.4 Owner dashboard journey

```
Home (Action Center)
   • "3 slots empty tomorrow AM → enable last-minute deal?"
   • "Beard oil predicted out in 9 days → reorder 20 units"
   • Today's revenue, bookings, occupancy %
   │
   ├─ Calendar (all staff)
   ├─ Services & Dynamic Pricing (rules + simulation)
   ├─ Inventory (health score, alerts, reorder)
   ├─ CRM (clients, loyalty, segments)
   ├─ Reports (revenue, P&L, staff performance, forecast — PDF/Excel)
   ├─ AI Receptionist (inbox + settings + handoff queue)
   └─ Settings (staff, hours, tax, payments, compliance, languages)
```

## 3.5 Key screens (MVP)

| Surface | Screens |
|---------|---------|
| Customer | Landing, Service list, Hairstyle Preview studio, Slot picker, Checkout, Confirmation, Manage booking |
| Staff | Agenda, Client card, Checkout/POS, Performance |
| Owner | Action Center, Calendar, Services & Pricing, Inventory, CRM, Reports, Settings |

## 3.6 AI Hairstyle Preview — interaction detail

1. **Consent gate** — explain what happens to the photo (processed in EU, deleted after session, never used for ID).
2. **Capture** — camera or upload; on-device face detection + quality check (lighting, angle).
3. **Studio** — left rail: style categories (fades, crops, beard styles, colors); center: live result with Before/After slider; quick "Surprise me" recommendation chip.
4. **Recommendation** — "Based on your face shape (oval) and current Berlin trends: try the *Textured Crop*."
5. **Convert** — "Book this look" → maps style → service + suggested stylist who specializes in it (upsell).

## 3.7 AI Receptionist conversational flow (Phase 2)

```
Inbound (WhatsApp / IG / Web chat / Phone)
   ▶ Intent: book | reschedule | price | hours | service info | other
   ▶ Slot search / action ▶ confirm
   ▶ Upsell suggestion ("add a beard trim for €8?")
   ▶ Low confidence / complaint ▶ human handoff (with transcript)
```

## 3.8 Visual & brand direction

- Modern, confident, slightly premium barbershop aesthetic; high-contrast, large type, generous spacing.
- Dark-mode first option for the customer studio (selfies look better).
- Design tokens shared across web + native; component library (see [Tech Stack](10-tech-stack.md)).
