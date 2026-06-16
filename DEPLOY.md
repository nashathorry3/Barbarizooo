# Deploying Barbarizoo

Pick a path. All keep data in the **EU** for GDPR.

> **Hostinger note:** Hostinger *shared / cloud / web* hosting is PHP/MySQL only —
> it **cannot** run Java (Spring Boot) or a Node server. The only Hostinger product
> that runs this stack is a **KVM VPS**. See **Option C** below.

---

## Option C — Hostinger KVM VPS (one VPS, Docker Compose)

Runs the whole stack — Postgres + API + frontend + automatic HTTPS — on a single
VPS with one command. Recommended Hostinger plan: **KVM 2** or higher, OS template
**Ubuntu 22.04** (or the "Ubuntu 24.04 with Docker" template to skip step 2).

### 1. Point your domain at the VPS
In your DNS, create two **A records** pointing at the VPS IP:
```
barbarizoo.de        →  <VPS_IP>
api.barbarizoo.de    →  <VPS_IP>
```

### 2. Install Docker on the VPS (skip if using the Docker template)
```bash
ssh root@<VPS_IP>
curl -fsSL https://get.docker.com | sh
```

### 3. Clone, configure, launch
```bash
git clone https://github.com/nashathorry3/Barbarizooo.git
cd Barbarizooo
cp .env.example .env
nano .env          # set DOMAIN, API_DOMAIN, DB_PASSWORD, JWT_SECRET (+ Stripe/Google if used)
docker compose up -d --build
```

That's it. Caddy automatically obtains Let's Encrypt certificates, so:
- Frontend → `https://barbarizoo.de`
- API → `https://api.barbarizoo.de`

Flyway creates all tables + seed data on first boot. Postgres data persists in a
Docker volume (`db-data`), so it survives restarts and redeploys.

### Updating after a code change
```bash
git pull && docker compose up -d --build
```

### Useful commands
```bash
docker compose ps            # service status
docker compose logs -f api   # tail backend logs
docker compose down          # stop everything (data is kept)
```

> Generate a strong JWT secret with `openssl rand -base64 48`.
> Open ports 80 + 443 in Hostinger's firewall (hPanel → VPS → Firewall).

### Auto-deploy on every push (GitHub Action)

[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) SSHes into the VPS
and runs `git pull && docker compose up -d --build` on every push to `main` (or
manually from the **Actions** tab).

**One-time setup:**

1. On the VPS, create a deploy SSH key and authorise it:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""
   cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
   cat ~/.ssh/deploy_key            # copy the PRIVATE key for the secret below
   ```
2. In GitHub → repo **Settings → Secrets and variables → Actions**, add:

   | Secret | Value | Required |
   |---|---|---|
   | `VPS_HOST` | VPS IP or hostname | yes |
   | `VPS_USER` | SSH user (e.g. `root`) | yes |
   | `VPS_SSH_KEY` | the **private** deploy key (full contents) | yes |
   | `VPS_PORT` | SSH port | no (default `22`) |
   | `VPS_APP_DIR` | repo path on the VPS | no (default `~/Barbarizooo`) |

3. Make sure the repo is already cloned on the VPS (the first deploy in
   **Option C** above) and checked out on the branch you push to.

After that, every push to `main` redeploys automatically. `.env` stays on the
server and is never touched by the deploy.

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

### Email reminders (real sending)
Confirmation + 24h + 2h reminders are scheduled automatically. To actually
**send them by email**, point the app at any SMTP provider (Brevo and Postmark
have free tiers). Backend:
```
NOTIFICATIONS_PROVIDER=email
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=<smtp-user>
MAIL_PASSWORD=<smtp-key>
MAIL_FROM=no-reply@yourdomain.de
MAIL_FROM_NAME=Your Salon
```
Without these, reminders run in **simulated** mode (logged, not sent). WhatsApp/SMS
are not integrated yet and fall back to logging.

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
