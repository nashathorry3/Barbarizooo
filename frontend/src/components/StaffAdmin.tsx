"use client";

import { useEffect, useState } from "react";
import { api, type Service, type Staff } from "@/lib/api";

const ROLES = ["STYLIST", "BARBER", "COLORIST", "RECEPTIONIST"];
const SENIORITY = ["JUNIOR", "MID", "SENIOR", "MASTER"];
const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#64748b",
];

/** Owner/manager: add/remove staff and assign them to services. */
export default function StaffAdmin() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  // New staff form
  const [name, setName] = useState("");
  const [role, setRole] = useState("STYLIST");
  const [seniority, setSeniority] = useState("MID");
  const [color, setColor] = useState(COLORS[0]);

  // Service-staff assignment state: serviceId → Set<staffId>
  const [assignments, setAssignments] = useState<Record<string, Set<string>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  function reload() {
    Promise.all([api.staff(), api.services()])
      .then(([stf, svc]) => {
        setStaff(stf);
        setServices(svc);
        const init: Record<string, Set<string>> = {};
        svc.forEach((s) => {
          init[s.id] = new Set(s.staffIds);
        });
        setAssignments(init);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(reload, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.createStaff({ displayName: name, role, seniorityLevel: seniority, color });
      setName("");
      reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeStaff(id: string) {
    setError(null);
    try {
      await api.deactivateStaff(id);
      reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function toggleAssignment(serviceId: string, staffId: string) {
    setAssignments((prev) => {
      const next = new Set(prev[serviceId] ?? []);
      if (next.has(staffId)) next.delete(staffId);
      else next.add(staffId);
      return { ...prev, [serviceId]: next };
    });
  }

  async function saveAssignments(serviceId: string) {
    setSaving(serviceId);
    setError(null);
    try {
      await api.updateServiceStaff(serviceId, [...(assignments[serviceId] ?? [])]);
      reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Team</h2>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Current staff list */}
      <div className="card p-5">
        <h3 className="mb-3 font-semibold">Stylists &amp; staff</h3>
        <div className="space-y-2">
          {staff.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-4 w-4 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <div>
                  <span className="font-medium">{s.displayName}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    {s.role} · {s.seniorityLevel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeStaff(s.id)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-red-300 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          {staff.length === 0 && (
            <p className="text-sm text-slate-400">No staff yet — add your first below.</p>
          )}
        </div>

        <form
          onSubmit={addStaff}
          className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-[2fr_1fr_1fr_auto_auto]"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name *"
            required
            className="input"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select value={seniority} onChange={(e) => setSeniority(e.target.value)} className="input">
            {SENIORITY.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full transition ${color === c ? "ring-2 ring-offset-1 ring-slate-400" : ""}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">
            Add
          </button>
        </form>
      </div>

      {/* Per-service staff assignments */}
      {services.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-1 font-semibold">Service assignments</h3>
          <p className="mb-3 text-xs text-slate-400">
            Choose which stylists can be booked for each service.
          </p>
          <div className="space-y-3">
            {services.map((svc) => (
              <div key={svc.id} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-sm">{svc.name}</span>
                  <button
                    onClick={() => saveAssignments(svc.id)}
                    disabled={saving === svc.id}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-brand hover:text-brand disabled:opacity-50"
                  >
                    {saving === svc.id ? "Saving…" : "Save"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {staff.map((st) => {
                    const on = assignments[svc.id]?.has(st.id) ?? false;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleAssignment(svc.id, st.id)}
                        className={`chip ${on ? "chip-on" : "chip-off"}`}
                      >
                        <span
                          className="mr-1.5 inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: st.color }}
                        />
                        {st.displayName}
                      </button>
                    );
                  })}
                  {staff.length === 0 && (
                    <span className="text-xs text-slate-400">No staff yet.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
