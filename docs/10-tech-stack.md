# 10 · Tech Stack Recommendation

Optimized for **MVP velocity**, **EU/GDPR data residency**, **AI workloads**, and a clean path from modular monolith to services.

## 10.1 At a glance

| Layer | Recommendation | Why |
|-------|----------------|-----|
| **Web (customer + dashboard)** | Next.js (React, TypeScript) | SSR for SEO booking pages, fast, one stack, great a11y/i18n |
| **Styling / UI** | Tailwind CSS + Radix/shadcn components | Accessible primitives, design tokens, RTL support |
| **Mobile** | React Native / Expo (Phase 2) or PWA first | Reuse React skills; PWA covers MVP |
| **Backend** | NestJS (TypeScript) **or** Django (Python) | Modular monolith; TS shares types with web, Python eases ML. Pick one team-fit; default **NestJS** + Python AI services |
| **API** | REST + GraphQL gateway (Apollo) | REST for partners/webhooks, GraphQL for app aggregation |
| **Primary DB** | PostgreSQL (managed, EU) + RLS | Relational core, row-level multi-tenancy, exclusion constraints |
| **Cache/queue** | Redis | Availability cache, sessions, rate limits |
| **Event bus** | NATS / Kafka (or managed pub/sub) | Async events, workers |
| **Workers** | BullMQ (Node) / Celery (Python) | Reminders, inference, forecasting, reorder |
| **Analytics warehouse** | ClickHouse or BigQuery (EU) | Forecasting features, dashboards |
| **Object storage** | S3-compatible (EU) + lifecycle TTL | Ephemeral selfie/result images |
| **Search (Phase 3)** | OpenSearch / Meilisearch | Marketplace discovery |

## 10.2 AI / ML stack

| Need | Recommendation |
|------|----------------|
| Hairstyle CV pipeline | Python: face detection/landmarks + face-parsing segmentation; diffusion-based inpainting w/ structural guidance for try-on; served on **EU GPU** |
| Model serving | Triton / TorchServe / managed EU GPU inference; autoscale + batching |
| Dynamic pricing / inventory | Gradient-boosted trees (XGBoost/LightGBM) + temporal features; scikit-learn pipelines |
| Receptionist LLM | LLM with **tool-calling** + RAG (EU data terms); vector store (pgvector / Qdrant EU) |
| Voice AI | Telephony (Twilio Voice) + STT/TTS (EU-compliant) + LLM agent, barge-in/low-latency |
| MLOps | Model registry + experiment tracking (MLflow); feature store; offline+online eval; per-model versioning |

## 10.3 Integrations

| Capability | Provider |
|------------|----------|
| Payments | **Stripe** (primary: cards/Klarna/SEPA), PayPal |
| Messaging | WhatsApp Business API (360dialog/Meta), SMS (Twilio/Sinch), Email (Postmark/SES EU) |
| Calendars | Google/Apple/Outlook 2-way |
| Accounting | DATEV, lexoffice export |
| Maps/events | Geo + local-events feed for pricing signals |

## 10.4 Infrastructure & DevOps

| Concern | Choice |
|---------|--------|
| Cloud region | EU only (e.g., Frankfurt) — GDPR data residency |
| Containers/orchestration | Docker + Kubernetes (managed) or Nomad; start simple (managed PaaS) |
| IaC | Terraform |
| CI/CD | GitHub Actions → staging → prod, automated tests + migrations |
| Secrets | Vault / cloud secret manager |
| Observability | OpenTelemetry tracing, Prometheus/Grafana, centralized logs, Sentry |
| Feature flags / experiments | Flag service for A/B (pricing, preview) |
| Edge/CDN | CDN for booking pages & assets (EU edge) |

## 10.5 Security & compliance tooling

- OAuth2/OIDC, short-lived JWT, refresh rotation; RBAC + tenant scoping.
- PCI scope minimized via Stripe tokenization.
- Encryption at rest + in transit; per-tenant encryption context.
- Immutable audit log (GoBD); consent & data-deletion service.
- DPIA for biometric/selfie processing; automated image TTL deletion.
- WCAG 2.2 AA / BITV 2.0 testing in CI (axe).

## 10.6 Why this stack

- **One language (TypeScript) across web + core backend** keeps the lean MVP team fast and type-safe end-to-end; **Python isolated to AI services** where its ecosystem wins.
- **Postgres + RLS** gives robust multi-tenancy without premature microservices.
- **Modular monolith → extract services** lets high-load/AI contexts scale independently later without over-engineering now.
- **EU-native choices throughout** make GDPR/residency a default, not a retrofit — a core differentiator for the German market.

## 10.7 Build vs. buy

| Build | Buy / integrate |
|-------|-----------------|
| Booking engine, pricing rules, inventory logic, AI orchestration, dashboards | Payments (Stripe), messaging (WhatsApp/SMS/Email), telephony/STT/TTS, base LLM, accounting export, maps/events |

Buy commodity infrastructure; **build the AI engines and integrated data loop** — that's the moat.
