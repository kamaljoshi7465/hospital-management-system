package com.hospital.hospital_management_system.controller;

import com.hospital.hospital_management_system.entity.DoctorAvailability;
import com.hospital.hospital_management_system.repository.DoctorAvailabilityRepository;
import com.hospital.hospital_management_system.repository.DoctorRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for the /api/doctors/{doctorId}/availability module.
 *
 * Endpoints:
 *   GET    /api/doctors/{doctorId}/availability              → get full weekly schedule
 *   GET    /api/doctors/{doctorId}/availability/{day}        → get one day's schedule
 *   PUT    /api/doctors/{doctorId}/availability              → replace full weekly schedule
 *   PUT    /api/doctors/{doctorId}/availability/{day}        → set/update a day's schedule
 *   DELETE /api/doctors/{doctorId}/availability/{day}        → remove a day from schedule
 *   DELETE /api/doctors/{doctorId}/availability              → clear entire schedule
 */
@RestController
@RequestMapping("/api/doctors/{doctorId}/availability")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailabilityController(
            DoctorAvailabilityRepository availabilityRepository,
            DoctorRepository doctorRepository) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
    }

    public record DailyScheduleRequest(
            @NotBlank
            @Pattern(regexp = "MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY")
            String dayOfWeek,
            @NotBlank String startTime,
            @NotBlank String endTime,
            String breaksJson,
            String timezone
    ) {}

    private Map<String, Object> toMap(DoctorAvailability da) {
        return Map.of(
                "id", da.getId(),
                "doctorId", da.getDoctor().getId(),
                "dayOfWeek", da.getDayOfWeek(),
                "startTime", da.getStartTime(),
                "endTime", da.getEndTime(),
                "breaksJson", da.getBreaksJson() != null ? da.getBreaksJson() : "[]",
                "timezone", da.getTimezone() != null ? da.getTimezone() : "Asia/Kolkata"
        );
    }

    /* ── GET /api/doctors/{doctorId}/availability ── */
    @GetMapping
    public ResponseEntity<?> getSchedule(@PathVariable Long doctorId) {
        if (!doctorRepository.existsById(doctorId))
            return ResponseEntity.notFound().build();

        List<Map<String, Object>> schedule = availabilityRepository.findByDoctor_Id(doctorId)
                .stream().map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(schedule);
    }

    /* ── GET /api/doctors/{doctorId}/availability/{day} ── */
    @GetMapping("/{day}")
    public ResponseEntity<?> getDaySchedule(
            @PathVariable Long doctorId,
            @PathVariable String day) {
        if (!doctorRepository.existsById(doctorId))
            return ResponseEntity.notFound().build();

        return availabilityRepository.findByDoctor_IdAndDayOfWeek(doctorId, day.toUpperCase())
                .map(da -> ResponseEntity.ok(toMap(da)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── PUT /api/doctors/{doctorId}/availability ── (bulk replace) ── */
    @PutMapping
    @Transactional
    public ResponseEntity<?> replaceSchedule(
            @PathVariable Long doctorId,
            @Valid @RequestBody List<DailyScheduleRequest> schedule) {
        var doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor == null) return ResponseEntity.notFound().build();

        availabilityRepository.deleteByDoctor_Id(doctorId);

        List<DoctorAvailability> saved = schedule.stream().map(req -> {
            DoctorAvailability da = new DoctorAvailability();
            da.setDoctor(doctor);
            da.setDayOfWeek(req.dayOfWeek().toUpperCase());
            da.setStartTime(req.startTime());
            da.setEndTime(req.endTime());
            da.setBreaksJson(req.breaksJson());
            da.setTimezone(req.timezone() != null ? req.timezone() : "Asia/Kolkata");
            return availabilityRepository.save(da);
        }).collect(Collectors.toList());

        List<Map<String, Object>> result = saved.stream().map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /* ── PUT /api/doctors/{doctorId}/availability/{day} ── */
    @PutMapping("/{day}")
    public ResponseEntity<?> setDaySchedule(
            @PathVariable Long doctorId,
            @PathVariable String day,
            @RequestBody DailyScheduleRequest req) {
        var doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor == null) return ResponseEntity.notFound().build();

        String upperDay = day.toUpperCase();
        DoctorAvailability da = availabilityRepository
                .findByDoctor_IdAndDayOfWeek(doctorId, upperDay)
                .orElse(new DoctorAvailability());

        da.setDoctor(doctor);
        da.setDayOfWeek(upperDay);
        da.setStartTime(req.startTime());
        da.setEndTime(req.endTime());
        da.setBreaksJson(req.breaksJson());
        da.setTimezone(req.timezone() != null ? req.timezone() : "Asia/Kolkata");

        DoctorAvailability saved = availabilityRepository.save(da);
        return ResponseEntity.ok(toMap(saved));
    }

    /* ── DELETE /api/doctors/{doctorId}/availability/{day} ── */
    @DeleteMapping("/{day}")
    public ResponseEntity<?> removeDaySchedule(
            @PathVariable Long doctorId,
            @PathVariable String day) {
        if (!doctorRepository.existsById(doctorId))
            return ResponseEntity.notFound().build();

        return availabilityRepository.findByDoctor_IdAndDayOfWeek(doctorId, day.toUpperCase())
                .<ResponseEntity<?>>map(da -> {
                    availabilityRepository.delete(da);
                    return ResponseEntity.noContent().build();
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── DELETE /api/doctors/{doctorId}/availability ── */
    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> clearSchedule(@PathVariable Long doctorId) {
        if (!doctorRepository.existsById(doctorId))
            return ResponseEntity.notFound().build();
        availabilityRepository.deleteByDoctor_Id(doctorId);
        return ResponseEntity.noContent().build();
    }
}
