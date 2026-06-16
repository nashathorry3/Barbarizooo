"use client";

import { useEffect, useState } from "react";
import { api, euro, type Salon, type Service, type Staff } from "@/lib/api";
import { getUser } from "@/lib/auth";

const CATEGORIES = ["HAIR", "BEARD", "COMBO", "COLOR"];

/** Owner/manager salon self-management: booking-link slug + services. */
export default function SalonAdmin() {
  const user = getUser();
  const isOwner = user?.role === "OWNER";

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [svcName, setSvcName] = useState("");
  const [svcCat, setSvcCat] = useState("HAIR");
  const [svcDur, setSvcDur] = useState(30);
  const [svcPrice, setSvcPrice] = useState(25);

  // Inline price editing per service.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function reload() {
    if (user) {
      api
        .salon(user.tenantId)
        .then((s) => {
          setSalon(s);
          setName(s.name);
          setSlug(s.slug ?? "");
        })
        .catch(() => {});
    }
    api.services().then(setServices).catch(() => {});
    api.staff().then(setStaff).catch(() => {});
  }

  useEffect(reload, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedMsg(null);
    try {
      const s = await api.updateSalon(name, slug);
      setSalon(s);
      setSlug(s.slug ?? "");
      setSavedMsg("Saved");
      setTimeout(() => setSavedMsg(null), 1500);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.createService({
        name: svcName,
        category: svcCat,
        durationMin: svcDur,
        basePriceCents: Math.round(svcPrice * 100),
        staffIds: staff.map((s) => s.id),
      });
      setSvcName("");
      reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeService(id: string) {
    setError(null);
    try {
      await api.deactivateService(id);
      reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function startEdit(id: string, currentCents: number) {
    setEditingId(id);
    setEditPrice(currentCents / 100);
  }

  async function savePrice(id: string) {
    setError(null);
    try {
      await api.updateService(id, { basePriceCents: Math.round(editPrice * 100) });
      setEditingId(null);
      reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Salon settings</h2>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Booking link + name (owner only) */}
      {isOwner && (
        <form onSubmit={saveSettings} className="card space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Salon name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Booking link
            </label>
            <div className="flex items-center gap-1">
              <span className="whitespace-nowrap rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                {origin}/book/
              </span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-salon"
                className="input rounded-l-none"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Lowercase letters, numbers and hyphens. Min 3 characters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">
              Save
            </button>
            {savedMsg && <span className="text-sm text-emerald-600">{savedMsg} ✓</span>}
          </div>
        </form>
      )}

      {/* Services management */}
      <div className="card p-5">
        <h3 className="mb-3 font-semibold">Services</h3>
        <div className="space-y-2">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-2.5"
            >
              <div>
                <span className="font-medium">{s.name}</span>
                <span className="ml-2 text-xs text-slate-400">
                  {s.durationMin} min · {s.category}
                </span>
              </div>

              {editingId === s.id ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-slate-400">€</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="input w-24 py-1"
                    autoFocus
                  />
                  <button
                    onClick={() => savePrice(s.id)}
                    className="rounded-lg bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-dark"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:border-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{euro(s.basePriceCents)}</span>
                  <button
                    onClick={() => startEdit(s.id, s.basePriceCents)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-brand hover:text-brand"
                  >
                    Edit price
                  </button>
                  <button
                    onClick={() => removeService(s.id)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-red-300 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-sm text-slate-400">No services yet — add your first below.</p>
          )}
        </div>

        <form
          onSubmit={addService}
          className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
        >
          <input
            value={svcName}
            onChange={(e) => setSvcName(e.target.value)}
            placeholder="Service name"
            required
            className="input"
          />
          <select value={svcCat} onChange={(e) => setSvcCat(e.target.value)} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={5}
            step={5}
            value={svcDur}
            onChange={(e) => setSvcDur(Number(e.target.value))}
            title="Duration (minutes)"
            className="input"
          />
          <input
            type="number"
            min={0}
            step={0.5}
            value={svcPrice}
            onChange={(e) => setSvcPrice(Number(e.target.value))}
            title="Price (EUR)"
            className="input"
          />
          <button type="submit" className="btn-primary whitespace-nowrap">
            Add
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-400">
          Duration in minutes · price in EUR. New services are bookable by all stylists.
        </p>
      </div>
    </section>
  );
}
