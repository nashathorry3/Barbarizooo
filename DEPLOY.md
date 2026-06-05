# Deploying Barbarizoo

Two paths. Both put data in the **EU (Frankfurt)** for GDPR.

---

## Option A — One-click with Render Blueprint (easiest)

The repo ships a [`render.yaml`](./render.yaml) that provisions the Postgres
database, the Spring Boot API (via Docker), and the Next.js frontend together.

1. Push this repo to GitHub (already done).
2. In [Render](https://render.com): **New → Blueprint** → connect this repo.
3. Render reads `render.yaml` and shows the three resources. Click **Apply**.
   - The database, `BARBARIZOO_JWT_SECRET`, and DB credentials are wired
     automatically. Flyway creates all tables + seed data on first boot.
4. After the API service is live, copy its URL (e.g.
   `https://barbarizoo-api.onrender.com`) and set it on the **frontend**:
   - `NEXT_PUBLIC_API_BASE = https://barbarizoo-api.onrender.com`
5. Copy the **frontend** URL and set it on the **API** service:
   - `CORS_ALLOWED_ORIGINS = https://barbarizoo-web.onrender.com`
6. Both redeploy. Done — open the frontend URL.

> Free Render services sleep after inactivity; the first request after a sleep
> takes ~30s to wake. Upgrade to a paid plan to keep them warm.

---

## Option B — Split hosting (Vercel + Render + Neon)

Best performance: Vercel for the frontend, Render for the API, Neon for Postgres.

### 1. Database — [Neon](https://neon.tech) (Frankfurt)
Create a project, copy the connection string, convert it to a JDBC URL:
`jdbc:postgresql://<host>/<db>?sslmode=require`

### 2. Backend — Render (Docker, `backend/` root dir)
Set env vars:
```
SPRING_PROFILES_ACTIVE=postgres
DB_URL=jdbc:postgresql://<neon-host>/<db>?sslmode=require
DB_USER=<user>
DB_PASSWORD=<password>
BARBARIZOO_JWT_SECRET=<random 48+ char string>
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

### 3. Frontend — [Vercel](https://vercel.com) (`frontend/` root dir)
```
NEXT_PUBLIC_API_BASE=https://your-api.onrender.com
```

---

## Optional integrations

### Stripe (real card payments)
Backend:
```
PAYMENTS_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
Frontend:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```
Then add a Stripe webhook → `https://<api>/api/v1/payments/webhook/stripe`,
event `payment_intent.succeeded`, and paste its signing secret above.
Without these, payments run in **simulated** mode (no real charges).

### Google Sign-In (real accounts)
Create an OAuth 2.0 **Web** client at
[console.cloud.google.com](https://console.cloud.google.com) → Credentials.
Add your frontend URL to **Authorised JavaScript origins**.
Backend:
```
GOOGLE_AUTH_MODE=real
GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
```
Frontend:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
```
Without these, Google sign-in runs in **mock** mode for local testing.

---

## Environment variable reference

| Variable | Where | Required | Default |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | API | yes (prod) | — (use `postgres`) |
| `DB_URL` / `DB_USER` / `DB_PASSWORD` | API | yes (prod) | local H2 |
| `BARBARIZOO_JWT_SECRET` | API | yes | dev secret (insecure) |
| `CORS_ALLOWED_ORIGINS` | API | yes | `http://localhost:3000` |
| `PORT` | API | injected by host | `8080` |
| `PAYMENTS_PROVIDER` | API | no | `simulated` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | API | if Stripe | — |
| `GOOGLE_AUTH_MODE` / `GOOGLE_CLIENT_ID` | API | if Google | `mock` |
| `NEXT_PUBLIC_API_BASE` | Web | yes | `http://localhost:8080` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Web | if Stripe | — |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Web | if Google | — |
