package com.barbarizoo.payments;

import com.barbarizoo.config.AppProperties;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Receives Stripe webhooks. The signature is verified with the configured
 * webhook secret; on {@code payment_intent.succeeded} the matching payment is
 * marked succeeded and its booking confirmed. This is the authoritative
 * confirmation path for real Stripe payments.
 */
@RestController
@RequestMapping("/api/v1/payments/webhook")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final PaymentService payments;
    private final AppProperties properties;

    public StripeWebhookController(PaymentService payments, AppProperties properties) {
        this.payments = payments;
        this.properties = properties;
    }

    @PostMapping("/stripe")
    public ResponseEntity<String> stripe(@RequestBody String payload,
                                         @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        String secret = properties.getPayments().getStripeWebhookSecret();
        if (!StringUtils.hasText(secret) || !StringUtils.hasText(signature)) {
            return ResponseEntity.badRequest().body("Webhook not configured");
        }
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, secret);
        } catch (Exception e) {
            log.warn("Rejected Stripe webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            event.getDataObjectDeserializer().getObject().ifPresent(obj -> {
                if (obj instanceof PaymentIntent intent) {
                    payments.markSucceededByRef(intent.getId());
                }
            });
        }
        return ResponseEntity.ok("ok");
    }
}
