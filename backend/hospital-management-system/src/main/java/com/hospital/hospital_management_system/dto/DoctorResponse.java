package com.hospital.hospital_management_system.dto;

import java.math.BigDecimal;
import java.util.List;

/** Response DTO for Doctor — matches the frontend Doctor interface exactly */
public record DoctorResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String phone,
        String specialization,
        String qualification,
        int experienceYears,
        BigDecimal consultationFee,
        BigDecimal rating,
        int totalReviews,
        String bio,
        String image,
        boolean available,
        List<String> workingDays,
        WorkingHours workingHours,
        int slotDurationMinutes
) {
    public record WorkingHours(String start, String end) {}
}
