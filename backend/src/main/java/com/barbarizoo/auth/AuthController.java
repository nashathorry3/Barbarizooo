package com.barbarizoo.auth;

import com.barbarizoo.auth.AuthDtos.GoogleLoginRequest;
import com.barbarizoo.auth.AuthDtos.LoginRequest;
import com.barbarizoo.auth.AuthDtos.TokenResponse;
import com.barbarizoo.auth.AuthDtos.UserDto;
import com.barbarizoo.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** Sign in or sign up with a Google ID token. */
    @PostMapping("/google")
    public TokenResponse google(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.loginWithGoogle(request);
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal AuthPrincipal principal) {
        return authService.me(principal);
    }
}
