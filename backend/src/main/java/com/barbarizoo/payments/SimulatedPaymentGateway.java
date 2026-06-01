package com.barbarizoo.payments;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Test/dev gateway that mimics a PSP without any external calls: it mints a
 * reference and "client secret", and confirmation always succeeds. Enabled
 * when {@code barbarizoo.payments.provider=simulated} (the default).
 */
@Component
@ConditionalOnProperty(name = "barbarizoo.payments.provider", havingValue = "simulated", matchIfMissing = true)
public class SimulatedPaymentGateway implements PaymentGateway {

    @Override
    public String name() {
        return "simulated";
    }

    @Override
    public Intent createIntent(int amountCents, String currency, String description) {
        String ref = "sim_pi_" + UUID.randomUUID().toString().replace("-", "").substring(0, 18);
        return new Intent(ref, ref + "_secret");
    }

    @Override
    public Result confirm(String providerRef) {
        // In simulation, every confirmation succeeds.
        return new Result(providerRef, true);
    }
}
