# 🚀 Go Live — Barbarizooo

Step-by-step to take Barbarizooo from this repo to a **real, public, money-handling
app**. Follow the phases in order. Total cost: **~€10/yr domain + ~€8/mo server**
(Stripe & Google are free; Stripe takes a fee per sale).

> The app ships in **safe demo mode** by default (simulated payments, demo login,
> logged emails). Each "real" integration below is an independent switch you turn
> on by adding keys to `.env` and re-running `docker compose up -d --build`.

---

## ✅ Master checklist

- [ ] Phase 1 — Buy a domain
- [ ] Phase 2 — Buy a VPS (server)
- [ ] Phase 3 — Point domain at the server (DNS)
- [ ] Phase 4 — Deploy (you're live in demo mode)
- [ ] Phase 5 — Turn on real Google sign-in
- [ ] Phase 6 — Turn on real Stripe payments
- [ ] Phase 7 — Turn on real email reminders (optional)
- [ ] Phase 8 — Legal + backups (Germany)

---

## Phase 1 — Domain (~€10/yr)
1. Buy a domain at [Hostinger](https://www.hostinger.com) or [Namecheap](https://www.namecheap.com),
   e.g. `barbarizooo.de`.

## Phase 2 — VPS / server (~€8/mo)
1. Buy a **VPS** (Hostinger **KVM 2**, Hetzner, or DigitalOcean). OS: **Ubuntu 24.04**.
2. Note the server's **IP address** and **root password**.
3. ⚠️ Not shared/web hosting — this is a Java + Node app and needs a VPS.

## Phase 3 — DNS
In your domain's DNS panel, add **two A-records** pointing at the VPS IP:
```
barbarizooo.de        →  <YOUR_VPS_IP>
api.barbarizooo.de    →  <YOUR_VPS_IP>
```
Wait 5 min–1 hr to propagate.

## Phase 4 — Deploy (live in demo mode)
```bash
ssh root@<YOUR_VPS_IP>
curl -fsSL https://get.docker.com | sh
git clone https://github.com/nashathorry3/Barbarizooo.git
cd Barbarizooo
cp .env.example .env
nano .env
```
Set the **5 required** values:
```bash
DOMAIN=barbarizooo.de
API_DOMAIN=api.barbarizooo.de
DB_USER=barbarizoo
DB_PASSWORD=<a strong password>
JWT_SECRET=<run: openssl rand -base64 48>
```
Launch:
```bash
docker compose up -d --build
```
After ~3 min, Caddy auto-provisions HTTPS and you're live:
- Frontend → `https://barbarizooo.de`
- API → `https://api.barbarizooo.de`

Open ports **80** + **443** in the VPS firewall.

---

## Phase 5 — Real Google sign-in
1. [console.cloud.google.com](https://console.cloud.google.com) → new project "Barbarizooo".
2. **APIs & Services → OAuth consent screen** → External → fill app name + email,
   add scopes `email` + `profile`. (Publish the app for public use.)
3. **Credentials → Create Credentials → OAuth client ID** → **Web application**.
4. **Authorized JavaScript origins** (exact, `https`, no trailing slash):
   ```
   https://barbarizooo.de
   ```
5. Copy the **Client ID**, add to `.env`:
   ```bash
   GOOGLE_AUTH_MODE=real
   GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com
   ```
6. `docker compose up -d --build`

## Phase 6 — Real Stripe payments (deposits)
> Use **Test mode** first (no real money, no business/bank needed yet).
1. Create an account at [stripe.com](https://dashboard.stripe.com/register).
2. **Developers → API keys** → copy `pk_test_...` and `sk_test_...`.
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://api.barbarizooo.de/api/v1/payments/webhook/stripe`
   - Event: **`payment_intent.succeeded`**
   - Copy the **Signing secret** `whsec_...`
4. Add to `.env`:
   ```bash
   PAYMENTS_PROVIDER=stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
5. `docker compose up -d --build`
6. Test card: `4242 4242 4242 4242`, any future expiry, any CVC.
7. **Going live:** complete Stripe **Activate account** (business + bank), switch to
   **Live mode**, create a new live webhook, and swap in `pk_live_`/`sk_live_`/new `whsec_`.

## Phase 7 — Real email reminders (optional)
1. Free account at [Brevo](https://www.brevo.com) or [Postmark](https://postmarkapp.com).
2. **Verify your sending domain** there (add their SPF/DKIM DNS records — required or
   email lands in spam).
3. Add to `.env`:
   ```bash
   NOTIFICATIONS_PROVIDER=email
   MAIL_HOST=smtp-relay.brevo.com
   MAIL_PORT=587
   MAIL_USERNAME=<smtp-user>
   MAIL_PASSWORD=<smtp-key>
   MAIL_FROM=no-reply@barbarizooo.de
   ```
4. `docker compose up -d --build`

---

## Phase 8 — Legal + backups (Germany)
- ⚖️ Add an **Impressum** and **Datenschutzerklärung (privacy policy)** page — legally
  required for German sites.
- 📄 Sign a **DPA / AVV** with each provider (Stripe, email provider, VPS host).
- 💾 Schedule **daily Postgres backups** (e.g. a `pg_dump` cron) — without this, a
  server loss means data loss.

---

## Day-to-day
```bash
docker compose ps                          # service status
docker compose logs -f api                 # tail backend logs
git pull && docker compose up -d --build   # deploy updates
docker compose down                        # stop (data kept in the db-data volume)
```

## Safety
- Never commit `.env` (already git-ignored) or paste **live** secret keys anywhere public.
- Only `pk_test_`/`sk_test_` keys are safe to share while testing.
