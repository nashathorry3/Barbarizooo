"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/** Whether real Stripe card collection is configured. */
export const stripeEnabled = PUBLISHABLE_KEY.length > 0;

const stripePromise = stripeEnabled ? loadStripe(PUBLISHABLE_KEY) : null;

function InnerForm({ onPaid }: { onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
      setBusy(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaid();
    } else {
      setError("Payment was not completed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={pay} className="space-y-3 text-left">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={!stripe || busy} className="btn-primary w-full">
        {busy ? "Processing…" : "Pay deposit"}
      </button>
    </form>
  );
}

/** Stripe Payment Element wrapped with the client secret from the backend. */
export default function StripeDepositForm({
  clientSecret,
  onPaid,
}: {
  clientSecret: string;
  onPaid: () => void;
}) {
  if (!stripePromise) return null;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <InnerForm onPaid={onPaid} />
    </Elements>
  );
}
