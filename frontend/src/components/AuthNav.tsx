"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/api";
import { clearSession, getUser } from "@/lib/auth";

/** Header navigation that reflects the current auth state. */
export default function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    window.addEventListener("barbarizoo-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("barbarizoo-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function logout() {
    clearSession();
    router.push("/");
  }

  return (
    <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
      <Link href="/" className="hover:text-brand">
        Book
      </Link>
      <Link href="/studio" className="hover:text-brand">
        AI Preview
      </Link>
      <Link href="/dashboard" className="hover:text-brand">
        Dashboard
      </Link>
      {user ? (
        <>
          <span className="hidden text-slate-400 sm:inline">{user.email}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-200 px-3 py-1 hover:border-slate-300"
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="rounded-lg bg-brand px-3 py-1 text-white hover:bg-brand-dark"
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
