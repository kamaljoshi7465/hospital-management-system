package com.hospital.hospital_management_system.dto;

import jakarta.validation.constraints.*;

/** Request DTO for creating a new Appointment — matches frontend CreateAppointmentRequest */
public record AppointmentRequest(
        @NotNull(message = "Doctor ID is required")
        Long doctorId,

        @NotNull(message = "Patient ID is required")
        Long patientId,

        @NotBlank(message = "Appointment date is required")
        @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Date must be in yyyy-MM-dd format")
        String appointmentDate,

        @NotBlank(message = "Start time is required")
        @Pattern(regexp = "\\d{2}:\\d{2}", message = "Start time must be in HH:mm format")
        String startTime,

        @NotBlank(message = "End time is required")
        @Pattern(regexp = "\\d{2}:\\d{2}", message = "End time must be in HH:mm format")
        String endTime,

        @Size(max = 500)
        String reason,

        @NotBlank(message = "Consultation type is required")
        @Pattern(regexp = "IN_PERSON|ONLINE", message = "Consultation type must be IN_PERSON or ONLINE")
        String consultationType
) {}
