package com.barbarizoo.tenant;

import java.util.UUID;

/**
 * Holds the current request's tenant (salon/location) id in a thread-local,
 * resolved from the {@code X-Tenant-Id} header by {@link TenantFilter}.
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void set(UUID tenantId) {
        CURRENT.set(tenantId);
    }

    public static UUID get() {
        UUID tenantId = CURRENT.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant bound to the current request");
        }
        return tenantId;
    }

    public static void clear() {
        CURRENT.remove();
    }
}
