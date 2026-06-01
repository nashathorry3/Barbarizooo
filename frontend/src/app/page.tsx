"use client";

import { useEffect, useMemo, useState } from "react";
import {
  api,
  euro,
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

export default function BookingPage() {
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
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  // Load catalog once; honor a ?category= deep link from the AI Preview studio.
  useEffect(() => {
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
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  // Staff that can perform the selected service.
  const eligibleStaff = useMemo(() => {
    if (!selectedService) return staff;
    return staff.filter((s) => selectedService.staffIds.includes(s.id));
  }, [staff, selectedService]);

  // Reset staff if it can no longer perform the chosen service.
  useEffect(() => {
    if (staffId && !eligibleStaff.some((s) => s.id === staffId)) {
      setStaffId("");
    }
  }, [eligibleStaff, staffId]);

  // Fetch availability whenever the selection is complete.
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
      // Refresh availability so the taken slot disappears.
      api.availability(serviceId, staffId, date).then(setAvailability);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function payDeposit() {
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

  function reset() {
    setBooked(null);
    setDepositCents(null);
    setPaid(false);
    setName("");
    setEmail("");
    setPhone("");
    setConsent(false);
  }

  if (booked) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="text-4xl">✅</div>
          <h2 className="mt-2 text-xl font-semibold text-emerald-800">
            Booking confirmed
          </h2>
          <p className="mt-1 text-emerald-700">
            {booked.serviceName} with {booked.staffName} ·{" "}
            {timeLabel(booked.startsAt)} · {euro(booked.priceCents)}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {paid ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <div className="text-3xl">💳</div>
            <p className="mt-2 font-medium text-slate-800">
              Deposit paid{depositCents ? ` — ${euro(depositCents)}` : ""}
            </p>
            <p className="text-sm text-slate-500">
              Your spot is secured. See you soon!
            </p>
            <button
              onClick={reset}
              className="mt-4 rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
            >
              Book another
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <p className="font-medium text-slate-800">Secure your appointment</p>
            <p className="text-sm text-slate-500">
              Pay a small deposit now to confirm. The rest is paid in the salon.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={payDeposit}
                disabled={paying}
                className="flex-1 rounded-lg bg-brand px-4 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {paying ? "Processing…" : "Pay deposit"}
              </button>
              <button
                onClick={reset}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-slate-600 hover:border-slate-300"
              >
                Later
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Test mode — no real card is charged.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Book an appointment</h1>
        <p className="text-slate-500">
          Choose a service, your stylist, and a time. Prices update with demand.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Step 1: service */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold">1 · Service</h2>
          <div className="space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
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
                <span className="font-semibold text-slate-700">
                  {euro(s.basePriceCents)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: staff + date */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold">2 · Stylist &amp; date</h2>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Stylist
          </label>
          <div className="mb-4 flex flex-wrap gap-2">
            {eligibleStaff.map((s) => (
              <button
                key={s.id}
                onClick={() => setStaffId(s.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  staffId === s.id
                    ? "border-brand bg-brand text-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {s.displayName}
              </button>
            ))}
            {selectedService && eligibleStaff.length === 0 && (
              <span className="text-sm text-slate-400">
                No stylist available for this service.
              </span>
            )}
          </div>

          <label className="mb-1 block text-sm font-medium text-slate-600">
            Date
          </label>
          <input
            type="date"
            value={date}
            min={todayPlus(0)}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </section>
      </div>

      {/* Step 3: slots */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
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
                className={`rounded-lg border px-3 py-2 text-sm transition ${
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

      {/* Step 4: details */}
      {slot && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold">4 · Your details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Full name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
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
              <span className="font-semibold text-slate-800">
                {euro(slot.priceCents)}
              </span>
            </div>
            <button
              disabled={!name.trim()}
              onClick={book}
              className="rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-40"
            >
              Confirm booking
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
