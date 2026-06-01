package com.barbarizoo.auth;

import com.barbarizoo.auth.AuthDtos.UserDto;
import com.barbarizoo.auth.UserManagementService.CreateUserRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserManagementController {

    private final UserManagementService users;

    public UserManagementController(UserManagementService users) {
        this.users = users;
    }

    /** List staff accounts — owners and managers. */
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public List<UserDto> list() {
        return users.list();
    }

    /** Create a staff account — owners only. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('OWNER')")
    public UserDto create(@Valid @RequestBody CreateUserRequest request) {
        return users.create(request);
    }
}
