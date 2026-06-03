package com.barbarizoo.auth.google;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

/**
 * Dev/test verifier (default). Accepts a token of the form
 * {@code mock|email|name|sub} so the Google sign-in flow can be exercised
 * locally without real Google credentials. Never enable in production.
 */
@Component
@ConditionalOnProperty(name = "barbarizoo.google.mode", havingValue = "mock", matchIfMissing = true)
public class MockGoogleTokenVerifier implements GoogleTokenVerifier {

    @Override
    public VerifiedGoogleUser verify(String idToken) {
        if (idToken == null || !idToken.startsWith("mock|")) {
            throw new BadCredentialsException("Invalid Google token (dev mode expects mock|email|name|sub)");
        }
        String[] parts = idToken.split("\\|", -1);
        if (parts.length < 4 || parts[1].isBlank()) {
            throw new BadCredentialsException("Malformed mock Google token");
        }
        String email = parts[1].trim();
        String name = parts[2].isBlank() ? email : parts[2].trim();
        String sub = parts[3].isBlank() ? "mock-" + email : parts[3].trim();
        return new VerifiedGoogleUser(sub, email, name, true);
    }
}
