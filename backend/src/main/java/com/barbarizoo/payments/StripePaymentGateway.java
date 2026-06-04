package com.barbarizoo.payments;

import com.barbarizoo.common.BadRequestException;
import com.barbarizoo.config.AppProperties;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Real Stripe gateway. Enabled with {@code barbarizoo.payments.provider=stripe}
 * and a {@code STRIPE_SECRET_KEY}. Creates a PaymentIntent (the client completes
 * payment with Stripe.js using the returned client secret) and confirms by
 * retrieving the intent's status. The authoritative confirmation in production
 * is the Stripe webhook (see {@code StripeWebhookController}).
 */
@Component
@ConditionalOnProperty(name = "barbarizoo.payments.provider", havingValue = "stripe")
public class StripePaymentGateway implements PaymentGateway {

    public StripePaymentGateway(AppProperties properties) {
        String key = properties.getPayments().getStripeSecretKey();
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("STRIPE_SECRET_KEY must be set when payments.provider=stripe");
        }
        Stripe.apiKey = key;
    }

    @Override
    public String name() {
        return "stripe";
    }

    @Override
    public Intent createIntent(int amountCents, String currency, String description) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) amountCents)
                    .setCurrency(currency.toLowerCase())
                    .setDescription(description)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build())
                    .build();
            PaymentIntent intent = PaymentIntent.create(params);
            return new Intent(intent.getId(), intent.getClientSecret());
        } catch (StripeException e) {
            throw new BadRequestException("Could not create payment: " + e.getMessage());
        }
    }

    @Override
    public Result confirm(String providerRef) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(providerRef);
            return new Result(providerRef, "succeeded".equals(intent.getStatus()));
        } catch (StripeException e) {
            throw new BadRequestException("Could not verify payment: " + e.getMessage());
        }
    }
}
