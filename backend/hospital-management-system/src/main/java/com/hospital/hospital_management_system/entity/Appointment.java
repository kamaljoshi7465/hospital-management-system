package com.hospital.hospital_management_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @NotBlank
    @Column(name = "appointment_date", nullable = false, length = 10)
    private String appointmentDate;  // yyyy-MM-dd

    @NotBlank
    @Column(name = "start_time", nullable = false, length = 5)
    private String startTime;  // HH:mm

    @NotBlank
    @Column(name = "end_time", nullable = false, length = 5)
    private String endTime;  // HH:mm

    @NotBlank
    @Column(nullable = false, length = 20)
    private String status;  // BOOKED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW

    @Size(max = 500)
    @Column(length = 500)
    private String reason;

    @NotBlank
    @Column(name = "consultation_type", nullable = false, length = 15)
    private String consultationType;  // IN_PERSON | ONLINE

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (status == null) {
            status = "BOOKED";
        }
    }
}
