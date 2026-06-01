# 4 · Database Design

## 4.1 Approach

- **Primary store:** PostgreSQL (managed, EU region) — relational core for bookings, payments, inventory.
- **Multi-tenancy:** shared database, shared schema with a `tenant_id` (salon/location) on every row, enforced by **Row-Level Security (RLS)**. Chains group locations under an `organization_id`.
- **Time-series / analytics:** events streamed to a columnar warehouse (e.g., BigQuery/ClickHouse) for forecasting and dashboards.
- **Cache & queues:** Redis (sessions, rate limits, availability cache), message broker for async jobs (reminders, AI inference, reorder).
- **Object storage:** S3-compatible (EU) for selfies/result images with **short TTL lifecycle** (auto-delete).

## 4.2 Entity-Relationship overview

```
organization 1───* location(tenant) 1───* staff
                       │                     │
                       │ 1                   │ *
                       ▼                     ▼
                    service ──* service_staff (skills)
                       │
                       │ *
                       ▼
   customer *──1 location   booking *──1 service
        │                      │ *──1 staff
        │ 1                    │ *──1 customer
        ▼                      ▼
   loyalty_account        payment / deposit
                              │
   product 1──* inventory_movement
   product 1──* stock_level (per location)
   supplier 1──* purchase_order ──* purchase_order_item
   pricing_rule *──1 location
   conversation (receptionist) *──1 location ──* message
```

## 4.3 Core tables (selected columns)

### Tenancy & identity
```sql
organization(id, name, country, vat_id, created_at)
location(id, organization_id, name, address, timezone, currency,
         locale_default, vat_scheme, gobd_settings, created_at)        -- tenant_id
app_user(id, email, phone, password_hash, locale, created_at)
staff(id, tenant_id, app_user_id, display_name, role,                  -- role: owner|manager|stylist
      seniority_level, commission_pct, color, active)
customer(id, tenant_id, app_user_id?, name, email, phone, locale,
         marketing_consent, gdpr_consent_at, notes, allergies, created_at)
```

### Catalog & scheduling
```sql
service(id, tenant_id, name, category, duration_min, base_price_cents,
        vat_rate, buffer_before_min, buffer_after_min, active)
service_staff(service_id, staff_id, proficiency)                       -- who can perform what
working_hours(id, tenant_id, staff_id, weekday, start_time, end_time)
time_off(id, tenant_id, staff_id, starts_at, ends_at, reason)
booking(id, tenant_id, customer_id, staff_id, service_id,
        starts_at, ends_at, status,                                    -- pending|confirmed|completed|no_show|cancelled
        price_cents, price_rule_id?, source,                           -- web|widget|receptionist|walk_in
        preview_style_id?, created_at)
booking_addon(booking_id, service_id, price_cents)
waitlist_entry(id, tenant_id, customer_id, service_id, staff_id?,
               desired_window, priority, status, created_at)
reminder(id, booking_id, channel, send_at, status)                     -- email|sms|whatsapp
```

### Payments & POS
```sql
payment(id, tenant_id, booking_id?, customer_id, provider,             -- stripe|paypal|sepa
        type, amount_cents, vat_amount_cents, currency, status,        -- deposit|full|refund|product
        provider_ref, created_at)
gift_card(id, tenant_id, code, balance_cents, expires_at)
membership(id, tenant_id, customer_id, plan_id, status, renews_at)
pos_sale(id, tenant_id, staff_id, customer_id?, total_cents, vat_cents, created_at)
pos_sale_item(pos_sale_id, product_id?, service_id?, qty, unit_price_cents)
```

### Inventory
```sql
product(id, tenant_id, sku, name, category, unit, cost_cents,
        retail_price_cents, reorder_point, reorder_qty, supplier_id?)
stock_level(product_id, tenant_id, on_hand, updated_at)                -- current quantity
inventory_movement(id, tenant_id, product_id, delta, reason,           -- sale|usage|restock|adjust|waste
                   booking_id?, created_at)
supplier(id, tenant_id, name, lead_time_days, contact, terms)
purchase_order(id, tenant_id, supplier_id, status, expected_at, created_at)
purchase_order_item(po_id, product_id, qty, unit_cost_cents)
stockout_forecast(id, tenant_id, product_id, predicted_out_date,
                  recommended_order_qty, confidence, generated_at)     -- ML output
```

### Dynamic pricing
```sql
pricing_rule(id, tenant_id, service_id?, type,                         -- offpeak|peak|lastminute|vip|loyalty|seasonal
             condition_json, adjustment_type, adjustment_value,        -- pct|flat
             priority, active)
price_quote(id, tenant_id, service_id, staff_id?, slot_start,
            base_cents, final_cents, applied_rule_ids, model_version, created_at)
demand_forecast(id, tenant_id, slot_start, predicted_demand, occupancy_pct, generated_at)
```

### CRM, loyalty & AI receptionist
```sql
loyalty_account(id, tenant_id, customer_id, points, tier)
referral(id, tenant_id, referrer_customer_id, referred_customer_id, status, reward)
conversation(id, tenant_id, customer_id?, channel, status, assigned_to?, created_at)
message(id, conversation_id, direction, sender, body, intent?, confidence?, created_at)
```

### Compliance & audit
```sql
consent_log(id, tenant_id, customer_id, purpose, granted, source, created_at)
audit_log(id, tenant_id, actor_id, action, entity, entity_id, diff_json, created_at)  -- GoBD/immutability
data_deletion_request(id, tenant_id, customer_id, status, requested_at, completed_at)
image_asset(id, tenant_id, customer_id?, kind, storage_key,            -- preview_source|preview_result
            expires_at, deleted_at)                                    -- ephemeral, TTL-enforced
```

## 4.4 Indexing & performance notes

- Composite indexes on `(tenant_id, starts_at)` for `booking`, `(tenant_id, product_id)` for stock, `(tenant_id, slot_start)` for forecasts.
- Availability is the hot path: cache computed free/busy per staff per day in Redis; invalidate on booking writes.
- Use partitioning by month on `booking`, `payment`, `inventory_movement` for large tenants.

## 4.5 Data integrity & constraints

- No double-booking: exclusion constraint on `(staff_id, tstzrange(starts_at, ends_at))` per tenant.
- Money always stored in integer **cents** + `currency`; VAT captured per line for GoBD.
- Soft-delete for customers (GDPR erasure replaces PII with tombstone, keeps anonymized financial record for tax retention).

## 4.6 Privacy & retention (GDPR)

| Data | Retention | Note |
|------|-----------|------|
| Selfie source/result images | Session-only, TTL ≤ 24h | Never used for biometric ID |
| Customer PII | Until erasure request / inactivity policy | Right-to-erasure → tombstone |
| Financial records | 10 years | German tax (GoBD) overrides erasure for invoices |
| Consent & audit logs | Per legal requirement | Immutable, append-only |
