package com.barbarizoo.auth;

import com.barbarizoo.auth.AuthDtos.GoogleLoginRequest;
import com.barbarizoo.auth.AuthDtos.LoginRequest;
import com.barbarizoo.auth.AuthDtos.TokenResponse;
import com.barbarizoo.auth.AuthDtos.UserDto;
import com.barbarizoo.auth.google.GoogleTokenVerifier;
import com.barbarizoo.auth.google.GoogleTokenVerifier.VerifiedGoogleUser;
import com.barbarizoo.domain.AppUser;
import com.barbarizoo.repo.AppUserRepository;
import com.barbarizoo.security.AuthPrincipal;
import com.barbarizoo.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenVerifier googleVerifier;
    private final SalonOnboardingService onboarding;

    public AuthService(AppUserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService,
                       GoogleTokenVerifier googleVerifier, SalonOnboardingService onboarding) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleVerifier = googleVerifier;
        this.onboarding = onboarding;
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        AppUser user = users.findByEmailIgnoreCaseAndActiveTrue(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        JwtService.IssuedToken issued = jwtService.issue(user);
        return new TokenResponse(issued.token(), issued.expiresAt(), toDto(user));
    }

    /** Sign in (or sign up on first use) with a verified Google ID token. */
    @Transactional
    public TokenResponse loginWithGoogle(GoogleLoginRequest request) {
        VerifiedGoogleUser g = googleVerifier.verify(request.idToken());
        if (!g.emailVerified()) {
            throw new BadCredentialsException("Google email is not verified");
        }
        // Existing account → sign in. New account → provision a fresh salon (the
        // owner gets their own tenant), making salon onboarding a single Google click.
        AppUser user = users.findByEmailIgnoreCaseAndActiveTrue(g.email())
                .map(existing -> linkGoogle(existing, g))
                .orElseGet(() -> onboarding.registerGoogleSalon(g));
        JwtService.IssuedToken issued = jwtService.issue(user);
        return new TokenResponse(issued.token(), issued.expiresAt(), toDto(user));
    }

    private AppUser linkGoogle(AppUser user, VerifiedGoogleUser g) {
        // Attach the Google identity to a pre-existing account on first Google sign-in.
        if (user.getProviderSub() == null) {
            user.setProvider("google");
            user.setProviderSub(g.sub());
        }
        return user;
    }

    public UserDto me(AuthPrincipal principal) {
        return new UserDto(
                principal.userId(), principal.email(), principal.displayName(),
                principal.role(), principal.tenantId());
    }

    private UserDto toDto(AppUser user) {
        return new UserDto(user.getId(), user.getEmail(), user.getDisplayName(),
                user.getRole(), user.getTenantId());
    }
}
