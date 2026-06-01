package com.barbarizoo.tenant;

import com.barbarizoo.config.AppProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Binds a tenant id to every request. Reads {@code X-Tenant-Id}; if absent,
 * falls back to the configured default tenant (the seed demo salon). In a
 * production build this would instead derive the tenant from the auth token.
 */
@Component
@Order(1)
public class TenantFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Tenant-Id";

    private final AppProperties properties;

    public TenantFilter(AppProperties properties) {
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            String header = request.getHeader(HEADER);
            UUID tenantId = StringUtils.hasText(header)
                    ? UUID.fromString(header)
                    : properties.getDefaultTenantId();
            TenantContext.set(tenantId);
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
