package com.barbarizoo.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password) {
    }

    public record UserDto(UUID id, String email, String displayName, String role, UUID tenantId) {
    }

    public record TokenResponse(String token, Instant expiresAt, UserDto user) {
    }
}
