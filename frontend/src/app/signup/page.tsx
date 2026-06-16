"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export default function SignupPage() {
  const [plan, setPlan] = useState<string | null>(null);

  // Read the chosen plan from ?plan= (set by the pricing page).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p && PLAN_LABELS[p]) setPlan(p);
  }, []);

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Register your salon</h1>
        {plan && (
          <p className="mt-2 inline-block rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand">
            {PLAN_LABELS[plan]} plan selected
          </p>
        )}
        <p className="mt-2 text-slate-500">
          One click with Google — no forms, no password. We set up your salon
          instantly so you can start taking bookings.
        </p>
      </div>

      <div className="card p-6">
        <GoogleSignInButton label="Sign up with Google" />

        <ul className="mt-5 space-y-2 text-sm text-slate-500">
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span> Your salon &amp; owner account created automatically
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span> Starter services ready — edit anytime
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span> Smart booking, AI preview, deposits &amp; reports
          </li>
        </ul>

        <p className="mt-5 text-center text-xs text-slate-400">
          By continuing you agree to processing per our GDPR notice.
        </p>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
