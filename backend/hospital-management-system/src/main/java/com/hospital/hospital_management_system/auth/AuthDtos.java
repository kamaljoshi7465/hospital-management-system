package com.hospital.hospital_management_system.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

public final class AuthDtos {
    private AuthDtos() {}

    public record SignupRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(min = 12, max = 72, message = "Password must be between 12 and 72 characters") String password,
            @NotBlank @Size(max = 25) String phone,
            @NotNull @Past LocalDate dateOfBirth,
            @NotBlank @Pattern(regexp = "MALE|FEMALE|OTHER") String gender
    ) {}

    public record LoginRequest(@NotBlank @Email @Size(max = 150) String email, @NotBlank @Size(max = 72) String password) {}
    public record AuthenticatedUser(Long id, String name, String email, String role, Long patientId, Long doctorId) {}
    public record AuthResponse(String accessToken, String tokenType, long expiresIn, AuthenticatedUser user) {}
}
