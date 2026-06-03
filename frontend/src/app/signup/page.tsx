"use client";

import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-slate-500">
          Get started in seconds with Google — no password to remember.
        </p>
      </div>

      <div className="card p-6">
        <GoogleSignInButton label="Sign up with Google" />

        <ul className="mt-5 space-y-2 text-sm text-slate-500">
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span> Smart booking &amp; reminders
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span> AI hairstyle recommendations
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span> Deposits, payments &amp; reports
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
