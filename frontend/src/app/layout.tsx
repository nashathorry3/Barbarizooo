import type { Metadata } from "next";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barbarizoo — Booking",
  description: "AI-native salon & barber platform for Germany",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent text-white shadow-sm">
                ✂️
              </span>
              <span className="bg-gradient-to-r from-brand to-accent-dark bg-clip-text text-lg text-transparent">
                Barbarizoo
              </span>
            </Link>
            <AuthNav />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-slate-400">
          Barbarizoo · AI-native salon platform · GDPR-ready · DE / EN / AR
        </footer>
      </body>
    </html>
  );
}
