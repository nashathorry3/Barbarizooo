"use client";

import { useEffect, useMemo, useState } from "react";
import StripeDepositForm, { stripeEnabled } from "@/components/StripeDepositForm";
import {
  api,
  euro,
  setActiveTenant,
  timeLabel,
  type Availability,
  type Booking,
  type Service,
  type Slot,
  type Staff,
} from "@/lib/api";

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Reusable customer booking flow. `tenantId` targets a specific salon (used by
 * the per-salon /book/[salon] page); when omitted it uses the default tenant.
 */
export default function BookingFlow({
  tenantId,
  salonName = "Barbarizoo Demo Barbershop · Berlin",
}: {
  tenantId?: string;
  salonName?: string;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(todayPlus(1));
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-booking deposit flow.
  const [booked, setBooked] = useState<Booking | null>(null);
  const [depositCents, setDepositCents] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [providerRef, setProviderRef] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  // Point the API at this salon, then load its catalog; honor a ?category=
  // deep link from the AI Preview studio.
  useEffect(() => {
    setActiveTenant(tenantId);
    Promise.all([api.services(), api.staff()])
      .then(([svc, stf]) => {
        setServices(svc);
        setStaff(stf);
        const category = new URLSearchParams(window.location.search)
          .get("category")
          ?.toUpperCase();
        if (category) {
          const match = svc.find((s) => s.category.toUpperCase() === category);
          if (match) setServiceId(match.id);
        }
      })
      .catch((e) => setError(e.message));
  }, [tenantId]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  const eligibleStaff = useMemo(() => {
    if (!selectedService) return staff;
    return staff.filter((s) => selectedService.staffIds.includes(s.id));
  }, [staff, selectedService]);

  useEffect(() => {
    if (staffId && !eligibleStaff.some((s) => s.id === staffId)) {
      setStaffId("");
    }
  }, [eligibleStaff, staffId]);

  useEffect(() => {
    setSlot(null);
    setAvailability(null);
    if (!serviceId || !staffId || !date) return;
    setLoadingSlots(true);
    setError(null);
    api
      .availability(serviceId, staffId, date)
      .then(setAvailability)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [serviceId, staffId, date]);

  async function book() {
    if (!slot || !serviceId || !staffId) return;
    setError(null);
    try {
      const booking = await api.createBooking({
        serviceId,
        staffId,
        startsAt: slot.start,
        customerName: name,
        customerEmail: email || undefined,
        customerPhone: phone || undefined,
        marketingConsent: consent,
      });
      setBooked(booking);
      setSlot(null);
      api.availability(serviceId, staffId, date).then(setAvailability);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // Simulated provider: one-click create + confirm.
  async function paySimulated() {
    if (!booked) return;
    setPaying(true);
    setError(null);
    try {
      const intent = await api.createDeposit(booked.id);
      setDepositCents(intent.amountCents);
      const payment = await api.confirmDeposit(intent.providerRef);
      if (payment.status === "SUCCEEDED") {
        setPaid(true);
      } else {
        setError("Payment could not be completed. Please try again.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPaying(false);
    }
  }

  // Stripe: create the intent, then collect the card with the Payment Element.
  async function startStripeDeposit() {
    if (!booked) return;
    setPaying(true);
    setError(null);
    try {
      const intent = await api.createDeposit(booked.id);
      setDepositCents(intent.amountCents);
      setProviderRef(intent.providerRef);
      setClientSecret(intent.clientSecret);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPaying(false);
    }
  }

  // Called once Stripe confirms the card payment client-side; syncs the backend
  // (the Stripe webhook is the authoritative path in production).
  async function onStripePaid() {
    try {
      if (providerRef) await api.confirmDeposit(providerRef);
    } catch {
      // Webhook will reconcile even if this sync call fails.
    }
    setPaid(true);
  }

  function reset() {
    setBooked(null);
    setDepositCents(null);
    setClientSecret(null);
    setProviderRef(null);
    setPaid(false);
    setName("");
    setEmail("");
    setPhone("");
    setConsent(false);
  }

  if (booked) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="text-4xl">✅</div>
          <h2 className="mt-2 text-xl font-semibold text-emerald-800">Booking confirmed</h2>
          <p className="mt-1 text-emerald-700">
            {booked.serviceName} with {booked.staffName} · {timeLabel(booked.startsAt)} ·{" "}
            {euro(booked.priceCents)}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {paid ? (
          <div className="card p-6 text-center">
            <div className="text-3xl">💳</div>
            <p className="mt-2 font-medium text-slate-800">
              Deposit paid{depositCents ? ` — ${euro(depositCents)}` : ""}
            </p>
            <p className="text-sm text-slate-500">Your spot is secured. See you soon!</p>
            <button onClick={reset} className="btn-primary mt-4">
              Book another
            </button>
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="font-medium text-slate-800">Secure your appointment</p>
            <p className="text-sm text-slate-500">
              Pay a small deposit{depositCents ? ` (${euro(depositCents)})` : ""} now to confirm.
              The rest is paid in the salon.
            </p>

            {stripeEnabled && clientSecret ? (
              <div className="mt-4">
                <StripeDepositForm clientSecret={clientSecret} onPaid={onStripePaid} />
                <button onClick={reset} className="btn-ghost mt-2 w-full">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={stripeEnabled ? startStripeDeposit : paySimulated}
                    disabled={paying}
                    className="btn-primary flex-1"
                  >
                    {paying ? "Processing…" : "Pay deposit"}
                  </button>
                  <button onClick={reset} className="btn-ghost">
                    Later
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  {stripeEnabled
                    ? "Secured by Stripe."
                    : "Test mode — no real card is charged."}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-7 text-white shadow-card">
        <p className="text-sm font-medium text-white/70">{salonName}</p>
        <h1 className="mt-1 text-3xl font-bold">Book your next look</h1>
        <p className="mt-1 max-w-lg text-white/80">
          Pick a service, your stylist, and a time — prices update live with demand. Not sure what
          suits you?{" "}
          <a href="/studio" className="font-semibold text-white underline">
            Try the AI Preview
          </a>
          .
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">1 · Service</h2>
          <div className="space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  serviceId === s.id
                    ? "border-brand bg-brand/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span>
                  <span className="font-medium">{s.name}</span>
                  <span className="block text-xs text-slate-400">
                    {s.durationMin} min · {s.category}
                  </span>
                </span>
                <span className="font-semibold text-slate-700">{euro(s.basePriceCents)}</span>
              </button>
            ))}
            {services.length === 0 && (
              <p className="text-sm text-slate-400">This salon has no services yet.</p>
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">2 · Stylist &amp; date</h2>
          <label className="mb-1 block text-sm font-medium text-slate-600">Stylist</label>
          <div className="mb-4 flex flex-wrap gap-2">
            {eligibleStaff.map((s) => (
              <button
                key={s.id}
                onClick={() => setStaffId(s.id)}
                className={`chip ${staffId === s.id ? "chip-on" : "chip-off"}`}
              >
                {s.displayName}
              </button>
            ))}
            {selectedService && eligibleStaff.length === 0 && (
              <span className="text-sm text-slate-400">No stylist available for this service.</span>
            )}
          </div>

          <label className="mb-1 block text-sm font-medium text-slate-600">Date</label>
          <input
            type="date"
            value={date}
            min={todayPlus(0)}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </section>
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">3 · Pick a time</h2>
        {!serviceId || !staffId ? (
          <p className="text-sm text-slate-400">
            Select a service and stylist to see available times.
          </p>
        ) : loadingSlots ? (
          <p className="text-sm text-slate-400">Loading slots…</p>
        ) : availability && availability.slots.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availability.slots.map((s) => (
              <button
                key={s.start}
                onClick={() => setSlot(s)}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  slot?.start === s.start
                    ? "border-brand bg-brand text-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                title={`${euro(s.priceCents)}`}
              >
                <span className="font-medium">{timeLabel(s.start)}</span>
                <span
                  className={`ml-2 text-xs ${
                    slot?.start === s.start ? "text-white/80" : "text-slate-400"
                  }`}
                >
                  {euro(s.priceCents)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No free slots on this day.</p>
        )}
      </section>

      {slot && (
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">4 · Your details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Full name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I agree to receive appointment reminders (GDPR consent).
          </label>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {selectedService?.name} · {timeLabel(slot.start)} ·{" "}
              <span className="font-semibold text-slate-800">{euro(slot.priceCents)}</span>
            </div>
            <button disabled={!name.trim()} onClick={book} className="btn-primary">
              Confirm booking
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
