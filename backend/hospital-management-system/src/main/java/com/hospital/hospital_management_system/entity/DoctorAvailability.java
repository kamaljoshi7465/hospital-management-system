package com.hospital.hospital_management_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(
        name = "doctor_availability",
        uniqueConstraints = @UniqueConstraint(name = "uk_avail_doctor_day", columnNames = {"doctor_id", "day_of_week"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    /** MONDAY | TUESDAY | ... | SUNDAY */
    @NotBlank
    @Column(name = "day_of_week", nullable = false, length = 10)
    private String dayOfWeek;

    @NotBlank
    @Column(name = "start_time", nullable = false, length = 5)
    private String startTime;

    @NotBlank
    @Column(name = "end_time", nullable = false, length = 5)
    private String endTime;

    /** JSON array of break periods: [{"startTime":"13:00","endTime":"14:00"}] */
    @Column(columnDefinition = "TEXT")
    private String breaksJson;

    @Builder.Default
    @Column(name = "timezone", length = 50)
    private String timezone = "Asia/Kolkata";
}
