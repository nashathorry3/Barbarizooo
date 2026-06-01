package com.barbarizoo.auth;

import com.barbarizoo.auth.AuthDtos.LoginRequest;
import com.barbarizoo.auth.AuthDtos.TokenResponse;
import com.barbarizoo.auth.AuthDtos.UserDto;
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

    public AuthService(AppUserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
