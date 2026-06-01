package com.barbarizoo.auth;

import com.barbarizoo.auth.AuthDtos.UserDto;
import com.barbarizoo.common.BadRequestException;
import com.barbarizoo.domain.AppUser;
import com.barbarizoo.repo.AppUserRepository;
import com.barbarizoo.tenant.TenantContext;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Manage dashboard accounts within a tenant (owner-governed). */
@Service
public class UserManagementService {

    public record CreateUserRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotBlank String displayName,
            @Pattern(regexp = "OWNER|MANAGER|STAFF", message = "role must be OWNER, MANAGER or STAFF") String role,
            UUID staffId) {
    }

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public UserManagementService(AppUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> list() {
        UUID tenant = TenantContext.get();
        return users.findAll().stream()
                .filter(u -> u.getTenantId().equals(tenant))
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public UserDto create(CreateUserRequest req) {
        UUID tenant = TenantContext.get();
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw new BadRequestException("A user with this email already exists");
        }
        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());
        user.setTenantId(tenant);
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setDisplayName(req.displayName());
        user.setRole(req.role());
        user.setStaffId(req.staffId());
        user.setActive(true);
        users.save(user);
        return toDto(user);
    }

    private UserDto toDto(AppUser u) {
        return new UserDto(u.getId(), u.getEmail(), u.getDisplayName(), u.getRole(), u.getTenantId());
    }
}
