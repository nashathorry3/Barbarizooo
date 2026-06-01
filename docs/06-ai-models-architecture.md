# 6 · AI Models Architecture

Four AI engines, each with a clear "lite → ML" maturity path so the product ships value early and deepens the moat over time.

```
                ┌─────────────────────────────────────────────┐
                │              AI Platform Layer               │
                │  feature store · model registry · eval/guard │
                │  EU-hosted inference · cost & PII governance  │
                └───────┬───────────┬───────────┬──────────────┘
                        │           │           │
        ┌───────────────┘   ┌───────┘   ┌───────┘        ┌───────────────┐
        ▼                   ▼           ▼                ▼
 Hairstyle Preview   Dynamic Pricing  Inventory      AI Receptionist
 (Computer Vision)   (Forecast+Opt)   Prediction     (LLM + Voice)
```

---

## 6.1 AI Hairstyle Preview (Computer Vision + Generative)

**Goal:** let a customer upload a selfie and realistically try haircuts, hair/beard color, with before/after and style recommendations.

**Pipeline:**
1. **Face detection & landmarking** — detect face, landmarks, hair/face segmentation mask (e.g., face-parsing model). Quality gate (pose, lighting, occlusion).
2. **Attribute estimation** — face shape (oval/round/square/heart…), estimated skin tone, perceived gender presentation, age band. *Used only for recommendation; not stored as biometric identity.*
3. **Style synthesis** — region-constrained image editing/generation: apply hairstyle/beard/color to the hair region while preserving identity. Approaches: diffusion-based inpainting with hair/beard masks + ControlNet-style structural guidance; curated style embeddings per preset for consistency.
4. **Recommendation engine** — ranks styles by face shape + skin tone + gender + age + **German trend index** (trend catalog refreshed from stylist input + social signals).
5. **Before/After compositing** + "Book this style" mapping to a service & specialized stylist.

**Maturity path:**
- **MVP:** curated preset library (10–15 looks) with masked inpainting; recommendation via rule table on face-shape × trend.
- **V2:** custom color/length controls, learned recommendation ranker from booking-conversion feedback.

**Quality & safety:**
- Output quality gate (auto-reject artifacts); "preview only" labeling.
- **GDPR:** explicit consent, EU inference, **ephemeral images** (TTL delete), no face-recognition/identification, DPIA on file.

**Metrics:** preview-to-booking lift, generation latency, reject rate, recommendation acceptance.

---

## 6.2 Dynamic Pricing Engine (Demand Forecast + Optimization)

**Goal:** recommend a price per service/slot/stylist that maximizes revenue/utilization within owner-set guardrails.

**Architecture (two stages):**
1. **Demand forecasting** — predict booking demand & occupancy per slot.
   - Features: weekday, hour, seasonality, weather, **local events** (festivals, holidays), historical occupancy, lead-time curve, stylist, service, recent trend.
   - Model: gradient-boosted trees / temporal models per location; cold-start via segment priors.
2. **Price optimization** — map predicted demand + price-elasticity estimate to a recommended price, constrained by owner rules (min/max, VIP, loyalty).
   - Output: `final_price = optimize(base, demand, elasticity, constraints)`.

**Scenarios encoded:** off-peak discount, peak surcharge, last-minute deals (decay as slot nears with low fill), VIP pricing, loyalty discounts, seasonal/event uplift, stylist-seniority premium.

**Maturity path:**
- **MVP:** transparent **rules engine** (owner-defined off-peak/peak/last-minute). Builds trust + training data.
- **V2:** ML demand forecast + elasticity; recommendations the owner can accept/override (human-in-the-loop).
- **V3:** automated within guardrails + revenue-simulation ("what-if") in dashboard.

**Guardrails:** never exceed owner min/max; explainable ("higher because Sat 5pm, 90% full"); price floors to protect brand; A/B against static pricing.

**Metrics:** revenue/chair uplift, off-peak utilization, forecast MAPE, override rate.

---

## 6.3 Smart Inventory Prediction

**Goal:** forecast stock-outs and recommend reorders for oils/products.

**Architecture:**
- **Consumption model** links product usage to **service usage** (e.g., each beard service consumes ~X ml oil) + retail sales.
- **Demand driver:** future **confirmed + forecasted bookings** by service → projected consumption → predicted depletion date.
- Features: consumption history, upcoming bookings, seasonality, top-selling products, business growth trend, supplier lead time.
- Model: per-product time-series / regression with booking-driven covariates; safety-stock via service-level target.

**Outputs:**
- `predicted_out_date`, `recommended_order_qty`, confidence.
- Human-readable alerts: *"Beard oil predicted to run out in 9 days — order 20 units before the weekend."*
- Auto-reorder **suggestions** (one-tap PO to supplier), respecting lead time.

**Maturity path:**
- **MVP:** reorder-point + threshold alerts (no ML).
- **V2:** booking-driven predictive depletion + reorder suggestions.
- **V3:** supplier-aware optimization, waste reduction, **Inventory Health Score** & cost forecasting.

**Metrics:** stock-out incidents avoided, waste %, days-of-cover accuracy, capital tied in stock.

---

## 6.4 AI Salon Receptionist (LLM + Voice)

**Goal:** an always-on assistant across WhatsApp, Instagram, web chat, and **phone (Voice AI)** that books, reschedules, quotes prices, recommends services, and upsells.

**Architecture:**
- **Omnichannel ingest** → normalize to a unified message.
- **Voice path:** Telephony → **STT** → LLM agent → **TTS** → caller (barge-in, low latency).
- **LLM agent** with **tool-calling** into internal APIs: `availability`, `create_booking`, `reschedule`, `pricing.quote`, `service_info`, `hours`. Constrained, function-call-only actions (no free-form commitments).
- **RAG** over the salon's own data (services, prices, policies, FAQs) → grounded, per-tenant answers.
- **Intent + confidence**; low confidence, complaints, or edge cases → **human handoff** with transcript.
- **Upsell policy:** suggests relevant add-ons ("add a beard trim for €8?") within configured rules.

**Guardrails:**
- Never books outside real availability; all actions are reversible & logged.
- Per-tenant tone/persona, languages **DE/EN/AR**.
- GDPR: consent for messaging, data minimization, EU processing; recordings handled per consent.

**Maturity path:**
- **Phase 2:** text channels (WhatsApp/IG/web) with booking + FAQ + upsell.
- **Phase 3:** Voice AI phone answering with handoff.

**Metrics:** % conversations fully automated, booking conversion via receptionist, handoff rate, CSAT, upsell attach rate.

---

## 6.5 Cross-cutting AI platform concerns

| Concern | Approach |
|---------|----------|
| Data residency | All training/inference in EU; PII never leaves region |
| Model registry & versioning | Track `model_version` on every quote/forecast/preview |
| Evaluation & guardrails | Offline eval sets + online A/B; quality gates before serving |
| Feedback loops | Booking conversions, owner overrides, reorder acceptances feed retraining |
| Cost control | Cache, batch, right-size GPU; per-tenant AI cost metering |
| Explainability | Human-readable reasons for prices, forecasts, recommendations |
| Fallbacks | Every AI degrades gracefully to deterministic rules |
