"use client";

import { useMemo } from "react";
import { euro, type Booking } from "@/lib/api";

/** Owner/manager analytics computed from the salon's bookings. */
export default function Analytics({ bookings }: { bookings: Booking[] }) {
  const stats = useMemo(() => computeStats(bookings), [bookings]);

  if (bookings.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Overview</h2>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Earned revenue" value={euro(stats.earnedRevenue)} hint="Completed appointments" tone="emerald" />
        <StatCard label="Projected revenue" value={euro(stats.projectedRevenue)} hint="Confirmed + completed" tone="indigo" />
        <StatCard label="Upcoming" value={String(stats.upcoming)} hint="Future, not cancelled" tone="violet" />
        <StatCard
          label="No-show rate"
          value={`${stats.noShowRate}%`}
          hint={`${stats.noShows} of ${stats.finished} finished`}
          tone={stats.noShowRate >= 15 ? "red" : "slate"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top services */}
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Top services</h3>
          {stats.topServices.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <div className="space-y-2.5">
              {stats.topServices.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{s.name}</span>
                    <span className="text-slate-400">
                      {s.count}× · {euro(s.revenue)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${Math.round((s.count / stats.topServices[0].count) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Busiest days */}
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Busiest days</h3>
          <div className="flex items-end justify-between gap-2 pt-2" style={{ height: "8rem" }}>
            {stats.byWeekday.map((d) => {
              const max = Math.max(...stats.byWeekday.map((x) => x.count), 1);
              const pct = Math.round((d.count / max) * 100);
              return (
                <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs text-slate-400">{d.count || ""}</span>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-brand to-brand-dark"
                    style={{ height: `${Math.max(pct, 3)}%` }}
                    title={`${d.count} bookings`}
                  />
                  <span className="text-xs text-slate-500">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const TONES: Record<string, string> = {
  emerald: "text-emerald-700",
  indigo: "text-indigo-700",
  violet: "text-violet-700",
  red: "text-red-600",
  slate: "text-slate-800",
};

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: keyof typeof TONES | string;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${TONES[tone] ?? TONES.slate}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function computeStats(bookings: Booking[]) {
  const now = new Date();

  const earnedRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((s, b) => s + b.priceCents, 0);
  const projectedRevenue = bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
    .reduce((s, b) => s + b.priceCents, 0);

  const upcoming = bookings.filter(
    (b) => new Date(b.startsAt) > now && b.status !== "CANCELLED"
  ).length;

  const noShows = bookings.filter((b) => b.status === "NO_SHOW").length;
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const finished = noShows + completed;
  const noShowRate = finished > 0 ? Math.round((noShows / finished) * 100) : 0;

  // Top services by booking count (excluding cancelled).
  const svcMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const b of bookings) {
    if (b.status === "CANCELLED") continue;
    const cur = svcMap.get(b.serviceName) ?? { name: b.serviceName, count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += b.priceCents;
    svcMap.set(b.serviceName, cur);
  }
  const topServices = [...svcMap.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  // Bookings by weekday (Mon..Sun), excluding cancelled.
  const counts = new Array(7).fill(0);
  for (const b of bookings) {
    if (b.status === "CANCELLED") continue;
    const jsDay = new Date(b.startsAt).getDay(); // 0=Sun..6=Sat
    const idx = (jsDay + 6) % 7; // shift so 0=Mon
    counts[idx] += 1;
  }
  const byWeekday = WEEKDAY_LABELS.map((label, i) => ({ label, count: counts[i] }));

  return {
    earnedRevenue,
    projectedRevenue,
    upcoming,
    noShows,
    finished,
    noShowRate,
    topServices,
    byWeekday,
  };
}
