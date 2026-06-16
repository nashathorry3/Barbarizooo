package com.barbarizoo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.UUID;

/** Strongly-typed access to the {@code barbarizoo.*} configuration block. */
@Component
@ConfigurationProperties(prefix = "barbarizoo")
public class AppProperties {

    private UUID defaultTenantId;
    private Cors cors = new Cors();
    private Jwt jwt = new Jwt();
    private Payments payments = new Payments();
    private Google google = new Google();
    private Notifications notifications = new Notifications();

    public UUID getDefaultTenantId() {
        return defaultTenantId;
    }

    public void setDefaultTenantId(UUID defaultTenantId) {
        this.defaultTenantId = defaultTenantId;
    }

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Payments getPayments() {
        return payments;
    }

    public void setPayments(Payments payments) {
        this.payments = payments;
    }

    public Google getGoogle() {
        return google;
    }

    public void setGoogle(Google google) {
        this.google = google;
    }

    public Notifications getNotifications() {
        return notifications;
    }

    public void setNotifications(Notifications notifications) {
        this.notifications = notifications;
    }

    public static class Cors {
        private String allowedOrigins = "http://localhost:3000";

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Jwt {
        private String secret;
        private long expirationMinutes = 720;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationMinutes() {
            return expirationMinutes;
        }

        public void setExpirationMinutes(long expirationMinutes) {
            this.expirationMinutes = expirationMinutes;
        }
    }

    public static class Google {
        private String mode = "mock";
        private String clientId = "";

        public String getMode() {
            return mode;
        }

        public void setMode(String mode) {
            this.mode = mode;
        }

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }
    }

    public static class Notifications {
        /** "simulated" (default, logs) or "email" (real SMTP). */
        private String provider = "simulated";
        private String fromEmail = "no-reply@barbarizoo.de";
        private String fromName = "Barbarizoo";

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }

        public String getFromEmail() {
            return fromEmail;
        }

        public void setFromEmail(String fromEmail) {
            this.fromEmail = fromEmail;
        }

        public String getFromName() {
            return fromName;
        }

        public void setFromName(String fromName) {
            this.fromName = fromName;
        }
    }

    public static class Payments {
        private int depositPercent = 30;
        private boolean requireDeposit = true;
        private String provider = "simulated";
        private String stripeSecretKey = "";
        private String stripeWebhookSecret = "";

        public int getDepositPercent() {
            return depositPercent;
        }

        public void setDepositPercent(int depositPercent) {
            this.depositPercent = depositPercent;
        }

        public boolean isRequireDeposit() {
            return requireDeposit;
        }

        public void setRequireDeposit(boolean requireDeposit) {
            this.requireDeposit = requireDeposit;
        }

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }

        public String getStripeSecretKey() {
            return stripeSecretKey;
        }

        public void setStripeSecretKey(String stripeSecretKey) {
            this.stripeSecretKey = stripeSecretKey;
        }

        public String getStripeWebhookSecret() {
            return stripeWebhookSecret;
        }

        public void setStripeWebhookSecret(String stripeWebhookSecret) {
            this.stripeWebhookSecret = stripeWebhookSecret;
        }
    }
}
