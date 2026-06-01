package com.barbarizoo.security;

import com.barbarizoo.config.AppProperties;
import com.barbarizoo.domain.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

/** Issues and verifies signed JWTs (HS256). */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(AppProperties properties) {
        this.key = Keys.hmacShaKeyFor(properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = properties.getJwt().getExpirationMinutes();
    }

    public record IssuedToken(String token, Instant expiresAt) {
    }

    public IssuedToken issue(AppUser user) {
        Instant now = Instant.now();
        Instant exp = now.plus(expirationMinutes, ChronoUnit.MINUTES);
        String token = Jwts.builder()
                .subject(user.getEmail())
                .claim("uid", user.getId().toString())
                .claim("tenant", user.getTenantId().toString())
                .claim("role", user.getRole())
                .claim("name", user.getDisplayName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
        return new IssuedToken(token, exp);
    }

    /** Parses and verifies a token, returning the principal, or throws if invalid. */
    public AuthPrincipal parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return new AuthPrincipal(
                UUID.fromString(claims.get("uid", String.class)),
                claims.getSubject(),
                UUID.fromString(claims.get("tenant", String.class)),
                claims.get("role", String.class),
                claims.get("name", String.class));
    }
}
