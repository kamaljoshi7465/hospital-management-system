package com.hospital.hospital_management_system.dto;

import jakarta.validation.constraints.*;

public record MedicationRequest(
        @NotBlank(message = "Medication name is required")
        @Size(max = 200)
        String name,

        @Size(max = 100)
        String dosage,

        @Size(max = 200)
        String frequency,

        @Size(max = 150)
        String doctorName,

        @Pattern(regexp = "ACTIVE|REFILL_DUE|COMPLETED", message = "Refill status must be ACTIVE, REFILL_DUE, or COMPLETED")
        String refillStatus
) {}
