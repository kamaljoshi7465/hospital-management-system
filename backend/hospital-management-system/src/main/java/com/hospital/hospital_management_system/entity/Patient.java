package com.hospital.hospital_management_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "patients",
        uniqueConstraints = @UniqueConstraint(name = "uk_patients_email", columnNames = "email")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @NotBlank(message = "Full name is required")
    @Size(max = 150)
    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    @Size(max = 150)
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Phone is required")
    @Size(max = 25)
    @Column(nullable = false, length = 25)
    private String phone;

    @NotNull(message = "Date of birth is required")
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    @Column(nullable = false, length = 10)
    private String gender;  // MALE | FEMALE | OTHER

    @Size(max = 10)
    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    // Address fields (embedded)
    @Column(name = "address_city", length = 100)
    private String addressCity;

    @Column(name = "address_state", length = 100)
    private String addressState;

    @Column(name = "address_country", length = 100)
    private String addressCountry;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Emergency Contact
    @Column(name = "emergency_name", length = 150)
    private String emergencyContactName;

    @Column(name = "emergency_relationship", length = 100)
    private String emergencyContactRelationship;

    @Column(name = "emergency_phone", length = 25)
    private String emergencyContactPhone;

    // Allergies (stored as comma-separated string)
    @Column(columnDefinition = "TEXT")
    private String allergies;

    // Chronic conditions (stored as comma-separated string)
    @Column(name = "chronic_conditions", columnDefinition = "TEXT")
    private String chronicConditions;

    // Vitals
    @Column(name = "vitals_blood_pressure", length = 20)
    private String vitalsBloodPressure;

    @Column(name = "vitals_heart_rate")
    private Integer vitalsHeartRate;

    @Column(name = "vitals_blood_sugar")
    private Integer vitalsBloodSugar;

    @Column(name = "vitals_weight_kg")
    private Double vitalsWeightKg;

    @Column(name = "vitals_height_cm")
    private Double vitalsHeightCm;

    @Column(name = "vitals_temperature_f")
    private Double vitalsTemperatureF;

    @Column(name = "vitals_last_updated")
    private LocalDate vitalsLastUpdated;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Medication> medications = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
