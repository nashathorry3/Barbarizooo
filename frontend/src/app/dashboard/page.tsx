"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  api,
  dateTimeLabel,
  euro,
  type Booking,
  type BookingStatus,
  type Payment,
  type Reminder,
  type Salon,
} from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  NO_SHOW: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-200 text-slate-500",
};

const NEXT_ACTIONS: { label: string; status: BookingStatus }[] = [
  { label: "Complete", status: "COMPLETED" },
  { label: "No-show", status: "NO_SHOW" },
  { label: "Cancel", status: "CANCELLED" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const role = user?.role;
  const canManage = role === "OWNER" || role === "MANAGER";

  const bookingUrl =
    salon && typeof window !== "undefined"
      ? `${window.location.origin}/book/${salon.slug ?? salon.id}`
      : "";

  function load() {
    setLoading(true);
    api
      .bookings()
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    if (user) {
      api.salon(user.tenantId).then(setSalon).catch(() => {});
    }
    // Payment & reminder listings are restricted to owners/managers.
    if (canManage) {
      api.payments().then(setPayments).catch(() => {});
      api.reminders().then(setReminders).catch(() => {});
    }
  }

  function copyLink() {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  async function dispatchReminders() {
    try {
      await api.dispatchReminders();
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // Redirect to login if there is no session; otherwise load bookings.
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    load();
  }, [router]);

  async function setStatus(id: string, status: BookingStatus) {
    try {
      await api.updateBookingStatus(id, status);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const revenue = bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.priceCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500">
            {role && (
              <span className="mr-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {role}
              </span>
            )}
            {bookings.length} bookings · projected revenue{" "}
            <span className="font-semibold text-slate-800">{euro(revenue)}</span>
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:border-slate-300"
        >
          Refresh
        </button>
      </div>

      {salon && (
        <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">{salon.name}</p>
            <p className="text-sm text-slate-500">
              Share your public booking link — put it in your Instagram bio, WhatsApp, or a QR code.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="max-w-[16rem] truncate rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
              {bookingUrl}
            </code>
            <button onClick={copyLink} className="btn-ghost whitespace-nowrap">
              {copied ? "Copied ✓" : "Copy link"}
            </button>
            <a href={bookingUrl} target="_blank" rel="noreferrer" className="btn-primary whitespace-nowrap">
              Open
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Stylist</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No bookings yet. Create one from the booking page.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dateTimeLabel(b.startsAt)}
                  </td>
                  <td className="px-4 py-3">{b.serviceName}</td>
                  <td className="px-4 py-3">{b.staffName}</td>
                  <td className="px-4 py-3">{b.customerName}</td>
                  <td className="px-4 py-3 font-medium">{euro(b.priceCents)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {NEXT_ACTIONS.map((a) => (
                        <button
                          key={a.status}
                          onClick={() => setStatus(b.id, a.status)}
                          className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-slate-300"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {canManage && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Deposits &amp; payments</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      No payments yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {dateTimeLabel(p.createdAt)}
                      </td>
                      <td className="px-4 py-3">{p.type}</td>
                      <td className="px-4 py-3 font-medium">{euro(p.amountCents)}</td>
                      <td className="px-4 py-3 text-slate-500">{p.provider}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            p.status === "SUCCEEDED"
                              ? "bg-emerald-100 text-emerald-700"
                              : p.status === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {canManage && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Reminders</h2>
            <button
              onClick={dispatchReminders}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:border-slate-300"
            >
              Dispatch due
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Send at</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Channel</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reminders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      No reminders yet.
                    </td>
                  </tr>
                ) : (
                  reminders.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {dateTimeLabel(r.sendAt)}
                      </td>
                      <td className="px-4 py-3">{r.type}</td>
                      <td className="px-4 py-3">{r.channel}</td>
                      <td className="px-4 py-3 text-slate-500">{r.recipient}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            r.status === "SENT"
                              ? "bg-emerald-100 text-emerald-700"
                              : r.status === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
