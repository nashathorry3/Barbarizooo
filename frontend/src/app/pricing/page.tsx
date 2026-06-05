"use client";

import Link from "next/link";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceSuffix?: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Für aufstrebende Salons mit bis zu 3 Mitarbeitern.",
    price: "€79",
    priceSuffix: "/ Monat",
    features: ["Basis Terminplanung", "Kundenkartei", "Standard Reporting"],
    cta: "Starter wählen",
    href: "/signup?plan=starter",
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Das Kraftpaket für etablierte Premium-Salons.",
    price: "€149",
    priceSuffix: "/ Monat",
    features: [
      "Alles aus Starter",
      "KI Style Preview Widget",
      "Inventar-Automatisierung",
      "AI Insights Dashboard",
    ],
    cta: "Professional wählen",
    href: "/signup?plan=professional",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Maßgeschneidert für Salon-Ketten und Franchises.",
    price: "Auf Anfrage",
    features: [
      "Multi-Standort Management",
      "Custom API Integration",
      "Dedizierter Account Manager",
    ],
    cta: "Vertrieb kontaktieren",
    href: "/signup?plan=enterprise",
  },
];

export default function PricingPage() {
  return (
    <div className="rounded-3xl bg-slate-50 px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Transparente Investition.
          </h1>
          <p className="mt-3 text-slate-500">
            Wählen Sie den Plan, der zu Ihrem Wachstum passt.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-400">
          Alle Pläne starten mit einem Klick per Google — keine Kreditkarte zum Testen nötig.
        </p>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  if (plan.featured) {
    return (
      <div className="relative rounded-3xl bg-[#0f3d2e] p-7 text-white shadow-xl lg:-mt-4 lg:pb-10">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase tracking-wide text-[#0f3d2e]">
          Am beliebtesten
        </span>
        <h2 className="text-xl font-bold">{plan.name}</h2>
        <p className="mt-1 text-sm text-white/70">{plan.tagline}</p>
        <p className="mt-6">
          <span className="text-4xl font-extrabold">{plan.price}</span>
          {plan.priceSuffix && <span className="ml-1 text-sm text-white/70">{plan.priceSuffix}</span>}
        </p>
        <ul className="mt-6 space-y-3 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> {f}
            </li>
          ))}
        </ul>
        <Link
          href={plan.href}
          className="mt-8 block rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-[#0f3d2e] transition hover:bg-slate-100"
        >
          {plan.cta}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
      <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
      <p className="mt-6">
        <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
        {plan.priceSuffix && <span className="ml-1 text-sm text-slate-500">{plan.priceSuffix}</span>}
      </p>
      <ul className="mt-6 space-y-3 text-sm text-slate-600">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span> {f}
          </li>
        ))}
      </ul>
      <Link
        href={plan.href}
        className="mt-8 block rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
      >
        {plan.cta}
      </Link>
    </div>
  );
}
