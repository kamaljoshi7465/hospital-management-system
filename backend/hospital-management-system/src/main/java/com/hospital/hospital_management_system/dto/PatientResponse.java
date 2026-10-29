package com.hospital.hospital_management_system.dto;

import java.time.OffsetDateTime;
import java.util.List;

/** Response DTO for Patient — matches the frontend Patient interface exactly */
public record PatientResponse(
        Long id,
        Long userId,
        String fullName,
        String email,
        String phone,
        String dateOfBirth,
        String gender,
        String bloodGroup,
        PatientAddress address,
        String createdAt,
        EmergencyContact emergencyContact,
        List<String> allergies,
        List<String> chronicConditions,
        PatientVitals vitals,
        List<MedicationInfo> medications
) {
    public record PatientAddress(String city, String state, String country) {}

    public record EmergencyContact(String name, String relationship, String phone) {}

    public record PatientVitals(
            String bloodPressure,
            Integer heartRate,
            Integer bloodSugar,
            Double weightKg,
            Double heightCm,
            Double temperatureF,
            String lastUpdated
    ) {}

    public record MedicationInfo(
            Long id,
            String name,
            String dosage,
            String frequency,
            String doctor,
            String refillStatus
    ) {}
}
