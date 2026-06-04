"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import BookingFlow from "@/components/BookingFlow";
import { api, type Salon } from "@/lib/api";

/** Public booking page for a specific salon, addressed by slug or id. */
export default function SalonBookingPage() {
  const params = useParams<{ salon: string }>();
  const ref = params.salon;
  const [salon, setSalon] = useState<Salon | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!ref) return;
    api
      .salon(ref)
      .then(setSalon)
      .catch(() => setNotFound(true));
  }, [ref]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-md card p-8 text-center">
        <div className="text-4xl">🔍</div>
        <h1 className="mt-2 text-xl font-semibold">Salon not found</h1>
        <p className="mt-1 text-slate-500">
          This booking link doesn’t match any salon. Please check the URL.
        </p>
      </div>
    );
  }

  if (!salon) {
    return <p className="text-center text-sm text-slate-400">Loading salon…</p>;
  }

  return <BookingFlow tenantId={salon.id} salonName={salon.name} />;
}
