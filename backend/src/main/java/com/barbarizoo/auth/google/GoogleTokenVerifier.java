package com.barbarizoo.auth.google;

/**
 * Verifies a Google ID token and returns the identity it asserts. A real
 * implementation checks Google's signature + audience; a mock implementation is
 * used for local development (selected via {@code barbarizoo.google.mode}).
 */
public interface GoogleTokenVerifier {

    VerifiedGoogleUser verify(String idToken);

    record VerifiedGoogleUser(String sub, String email, String name, boolean emailVerified) {
    }
}
