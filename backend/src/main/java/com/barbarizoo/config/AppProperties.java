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
}
