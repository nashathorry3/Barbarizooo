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

    public static class Cors {
        private String allowedOrigins = "http://localhost:3000";

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }
}
