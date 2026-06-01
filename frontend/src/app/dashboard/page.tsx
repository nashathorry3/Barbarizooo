"use client";

import { useEffect, useState } from "react";
import {
  api,
  dateTimeLabel,
  euro,
  type Booking,
  type BookingStatus,
} from "@/lib/api";

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .bookings()
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

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
          <h1 className="text-2xl font-bold">Owner dashboard</h1>
          <p className="text-slate-500">
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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
    </div>
  );
}
