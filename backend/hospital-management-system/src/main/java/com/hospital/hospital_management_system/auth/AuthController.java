package com.hospital.hospital_management_system.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import static com.hospital.hospital_management_system.auth.AuthDtos.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) { return authService.signup(request); }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) { return authService.login(request); }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal Jwt jwt) { authService.logout(jwt); }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public AuthenticatedUser me(@AuthenticationPrincipal Jwt jwt) { return authService.profile(jwt); }
}
