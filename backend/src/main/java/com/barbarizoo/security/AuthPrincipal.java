package com.barbarizoo.security;

import java.util.UUID;

/** The authenticated user attached to the Spring Security context. */
public record AuthPrincipal(UUID userId, String email, UUID tenantId, String role, String displayName) {
}
