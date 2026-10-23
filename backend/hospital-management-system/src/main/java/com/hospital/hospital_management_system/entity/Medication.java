package com.hospital.hospital_management_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "medications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotBlank(message = "Medication name is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String name;

    @Size(max = 100)
    @Column(length = 100)
    private String dosage;

    @Size(max = 200)
    @Column(length = 200)
    private String frequency;

    /** Free-text doctor name for display purposes */
    @Size(max = 150)
    @Column(name = "doctor_name", length = 150)
    private String doctorName;

    /** ACTIVE | REFILL_DUE | COMPLETED */
    @Builder.Default
    @Column(name = "refill_status", nullable = false, length = 20)
    private String refillStatus = "ACTIVE";
}
