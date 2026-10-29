package com.hospital.hospital_management_system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

/** Request DTO for creating/updating a Patient */
public record PatientRequest(
        Long userId,

        @NotBlank(message = "Full name is required")
        @Size(max = 150)
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        @Size(max = 150)
        String email,

        @NotBlank(message = "Phone is required")
        @Size(max = 25)
        String phone,

        @NotBlank(message = "Date of birth is required")
        String dateOfBirth,

        @NotBlank(message = "Gender is required")
        @Pattern(regexp = "MALE|FEMALE|OTHER", message = "Gender must be MALE, FEMALE, or OTHER")
        String gender,

        @Size(max = 10)
        String bloodGroup,

        @Valid
        PatientAddressRequest address,

        @Valid
        EmergencyContactRequest emergencyContact,

        List<String> allergies,

        List<String> chronicConditions,

        @Valid
        VitalsRequest vitals
) {
    public record PatientAddressRequest(
            @Size(max = 100) String city,
            @Size(max = 100) String state,
            @Size(max = 100) String country
    ) {}

    public record EmergencyContactRequest(
            @Size(max = 150) String name,
            @Size(max = 100) String relationship,
            @Size(max = 25) String phone
    ) {}

    public record VitalsRequest(
            String bloodPressure,
            Integer heartRate,
            Integer bloodSugar,
            Double weightKg,
            Double heightCm,
            Double temperatureF
    ) {}
}
