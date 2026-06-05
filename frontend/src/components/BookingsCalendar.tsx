"use client";

import { useMemo, useState } from "react";
import { euro, timeLabel, type Booking, type BookingStatus } from "@/lib/api";

const STATUS_DOT: Record<BookingStatus, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-indigo-500",
  COMPLETED: "bg-emerald-500",
  NO_SHOW: "bg-red-500",
  CANCELLED: "bg-slate-300",
};

const STATUS_CARD: Record<BookingStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50",
  CONFIRMED: "border-indigo-200 bg-indigo-50",
  COMPLETED: "border-emerald-200 bg-emerald-50",
  NO_SHOW: "border-red-200 bg-red-50",
  CANCELLED: "border-slate-200 bg-slate-50 opacity-60",
};

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = (date.getDay() + 6) % 7; // 0 = Monday
  date.setDate(date.getDate() - day);
  return date;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Week-view calendar of bookings, grouped by day. */
export default function BookingsCalendar({ bookings }: { bookings: Booking[] }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const byDay = useMemo(() => {
    return days.map((day) =>
      bookings
        .filter((b) => sameDay(new Date(b.startsAt), day))
        .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    );
  }, [days, bookings]);

  const weekEnd = days[6];
  const rangeLabel = `${weekStart.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  })} – ${weekEnd.toLocaleDateString("de-DE", { day: "numeric", month: "short" })}`;

  function shift(weeks: number) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + weeks * 7);
    setWeekStart(d);
  }

  const today = new Date();

  return (
    <div className="card p-4">
      {/* Week navigation */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold">{rangeLabel}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm hover:border-slate-300"
          >
            ←
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm hover:border-slate-300"
          >
            Today
          </button>
          <button
            onClick={() => shift(1)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm hover:border-slate-300"
          >
            →
          </button>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day, i) => {
          const isToday = sameDay(day, today);
          const dayBookings = byDay[i];
          return (
            <div key={i} className="min-h-[8rem] rounded-xl border border-slate-100 p-1.5">
              <div
                className={`mb-1.5 rounded-lg px-2 py-1 text-center text-xs font-medium ${
                  isToday ? "bg-brand text-white" : "text-slate-500"
                }`}
              >
                {day.toLocaleDateString("de-DE", { weekday: "short" })}{" "}
                {day.getDate()}
              </div>
              <div className="space-y-1.5">
                {dayBookings.length === 0 ? (
                  <p className="px-1 py-2 text-center text-[11px] text-slate-300">—</p>
                ) : (
                  dayBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`rounded-lg border px-2 py-1.5 text-xs ${STATUS_CARD[b.status]}`}
                      title={`${b.serviceName} · ${b.customerName} · ${b.status}`}
                    >
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[b.status]}`} />
                        {timeLabel(b.startsAt)}
                      </div>
                      <div className="truncate text-slate-600">{b.serviceName}</div>
                      <div className="truncate text-[11px] text-slate-400">
                        {b.customerName} · {euro(b.priceCents)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
        {(["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"] as BookingStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
