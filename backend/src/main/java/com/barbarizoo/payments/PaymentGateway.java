package com.barbarizoo.payments;

/**
 * Provider-agnostic payment gateway. A simulated implementation ships by
 * default; a Stripe implementation can be added behind the same interface
 * (selected via {@code barbarizoo.payments.provider}) without touching callers.
 */
public interface PaymentGateway {

    /** Provider name stored on the payment row (e.g. "simulated", "stripe"). */
    String name();

    /** Creates an off-session payment intent and returns its reference + client secret. */
    Intent createIntent(int amountCents, String currency, String description);

    /** Captures/confirms a previously created intent. */
    Result confirm(String providerRef);

    record Intent(String providerRef, String clientSecret) {
    }

    record Result(String providerRef, boolean succeeded) {
    }
}
