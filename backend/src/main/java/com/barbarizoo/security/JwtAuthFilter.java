package com.barbarizoo.security;

import com.barbarizoo.config.AppProperties;
import com.barbarizoo.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Resolves authentication and tenant for every request:
 * <ul>
 *   <li>If a valid Bearer token is present, sets the security context and binds
 *       the tenant from the token (authoritative).</li>
 *   <li>Otherwise (public booking flow), binds the tenant from {@code X-Tenant-Id}
 *       or the configured default.</li>
 * </ul>
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String TENANT_HEADER = "X-Tenant-Id";

    private final JwtService jwtService;
    private final AppProperties properties;

    public JwtAuthFilter(JwtService jwtService, AppProperties properties) {
        this.jwtService = jwtService;
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            AuthPrincipal principal = resolveToken(request);
            if (principal != null) {
                var auth = new UsernamePasswordAuthenticationToken(
                        principal, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + principal.role())));
                SecurityContextHolder.getContext().setAuthentication(auth);
                TenantContext.set(principal.tenantId());
            } else {
                TenantContext.set(resolveHeaderTenant(request));
            }
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
            SecurityContextHolder.clearContext();
        }
    }

    private AuthPrincipal resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        try {
            return jwtService.parse(header.substring(7));
        } catch (Exception ex) {
            return null; // invalid/expired token → treated as anonymous
        }
    }

    private UUID resolveHeaderTenant(HttpServletRequest request) {
        String header = request.getHeader(TENANT_HEADER);
        return StringUtils.hasText(header)
                ? UUID.fromString(header)
                : properties.getDefaultTenantId();
    }
}
