package com.barbarizoo.auth.google;

import com.barbarizoo.config.AppProperties;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

import java.util.Collections;

/** Verifies genuine Google ID tokens. Enabled when {@code barbarizoo.google.mode=real}. */
@Component
@ConditionalOnProperty(name = "barbarizoo.google.mode", havingValue = "real")
public class RealGoogleTokenVerifier implements GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public RealGoogleTokenVerifier(AppProperties properties) {
        String clientId = properties.getGoogle().getClientId();
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException(
                    "barbarizoo.google.client-id must be set when google.mode=real");
        }
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    @Override
    public VerifiedGoogleUser verify(String idToken) {
        try {
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new BadCredentialsException("Invalid Google token");
            }
            Payload p = token.getPayload();
            return new VerifiedGoogleUser(
                    p.getSubject(),
                    p.getEmail(),
                    (String) p.get("name"),
                    Boolean.TRUE.equals(p.getEmailVerified()));
        } catch (BadCredentialsException e) {
            throw e;
        } catch (Exception e) {
            throw new BadCredentialsException("Could not verify Google token");
        }
    }
}
