package com.hospital.hospital_management_system.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

/** Request DTO for creating/updating a Doctor */
public record DoctorRequest(
        Long userId,

        @NotBlank(message = "Name is required")
        @Size(max = 150)
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        @Size(max = 150)
        String email,

        @NotBlank(message = "Phone is required")
        @Size(max = 20)
        String phone,

        @NotBlank(message = "Specialization is required")
        @Size(max = 100)
        String specialization,

        @NotBlank(message = "Qualification is required")
        @Size(max = 200)
        String qualification,

        @Min(0)
        int experienceYears,

        @NotNull(message = "Consultation fee is required")
        @DecimalMin("0.0")
        BigDecimal consultationFee,

        @DecimalMin("0.0")
        @DecimalMax("5.0")
        BigDecimal rating,

        @Min(0)
        int totalReviews,

        String bio,

        String image,

        boolean available,

        /** e.g. ["Monday","Tuesday","Wednesday"] */
        List<String> workingDays,

        String workingHoursStart,

        String workingHoursEnd,

        @Min(10)
        int slotDurationMinutes
) {}
