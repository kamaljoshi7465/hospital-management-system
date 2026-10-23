package com.hospital.hospital_management_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "doctors",
        uniqueConstraints = @UniqueConstraint(name = "uk_doctors_email", columnNames = "email")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @NotBlank(message = "Name is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    @Size(max = 150)
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Phone is required")
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String phone;

    @NotBlank(message = "Specialization is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String specialization;

    @NotBlank(message = "Qualification is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String qualification;

    @Min(0)
    @Column(name = "experience_years", nullable = false)
    private int experienceYears;

    @DecimalMin("0.0")
    @Column(name = "consultation_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @DecimalMin("0.0")
    @DecimalMax("5.0")
    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal rating;

    @Min(0)
    @Column(name = "total_reviews", nullable = false)
    private int totalReviews;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 500)
    private String image;

    @Builder.Default
    @Column(nullable = false)
    private boolean available = true;

    /** Comma-separated working days e.g. "Monday,Tuesday,Wednesday" */
    @Column(name = "working_days", length = 200)
    private String workingDays;

    @Column(name = "working_hours_start", length = 10)
    private String workingHoursStart;

    @Column(name = "working_hours_end", length = 10)
    private String workingHoursEnd;

    @Min(10)
    @Builder.Default
    @Column(name = "slot_duration_minutes", nullable = false)
    private int slotDurationMinutes = 30;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Appointment> appointments = new ArrayList<>();
}
