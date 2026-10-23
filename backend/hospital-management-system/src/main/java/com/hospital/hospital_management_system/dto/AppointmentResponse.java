package com.hospital.hospital_management_system.dto;

import java.time.OffsetDateTime;

/** Response DTO for Appointment — matches the frontend Appointment interface exactly */
public record AppointmentResponse(
        Long id,
        Long patientId,
        Long doctorId,
        String appointmentDate,
        String startTime,
        String endTime,
        String status,
        String reason,
        String consultationType,
        String createdAt,

        /** Enriched patient summary (optional, populated on demand) */
        PatientSummary patient,

        /** Enriched doctor summary (optional, populated on demand) */
        DoctorSummary doctor
) {
    public record PatientSummary(Long id, String fullName, String email, String phone) {}
    public record DoctorSummary(Long id, String name, String specialization, String email, String phone) {}
}
