package com.hospital.hospital_management_system.controller;

import com.hospital.hospital_management_system.dto.AppointmentRequest;
import com.hospital.hospital_management_system.dto.AppointmentResponse;
import com.hospital.hospital_management_system.entity.Appointment;
import com.hospital.hospital_management_system.repository.AppointmentRepository;
import com.hospital.hospital_management_system.repository.DoctorRepository;
import com.hospital.hospital_management_system.repository.PatientRepository;
import com.hospital.hospital_management_system.service.Mappers;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for the /api/appointments module.
 *
 * Endpoints:
 *   GET    /api/appointments                             → list all (optional filters: patientId, doctorId, status, date)
 *   GET    /api/appointments/{id}                        → get by ID
 *   GET    /api/appointments/patient/{patientId}         → by patient
 *   GET    /api/appointments/doctor/{doctorId}           → by doctor
 *   GET    /api/appointments/doctor/{doctorId}/today     → doctor's today appointments
 *   POST   /api/appointments                             → book appointment
 *   PATCH  /api/appointments/{id}/status                 → update status
 *   PATCH  /api/appointments/{id}/reschedule             → reschedule
 *   DELETE /api/appointments/{id}                        → cancel/delete
 */
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentController(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    private static final List<String> VALID_STATUSES = List.of("BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW");

    /* ── GET /api/appointments ── */
    @GetMapping
    public List<AppointmentResponse> getAllAppointments(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date
    ) {
        List<Appointment> results;

        if (patientId != null && status != null) {
            results = appointmentRepository.findByPatient_IdAndStatus(patientId, status.toUpperCase());
        } else if (patientId != null) {
            results = appointmentRepository.findByPatient_Id(patientId);
        } else if (doctorId != null && date != null) {
            results = appointmentRepository.findByDoctor_IdAndAppointmentDate(doctorId, date);
        } else if (doctorId != null && status != null) {
            results = appointmentRepository.findByDoctor_IdAndStatus(doctorId, status.toUpperCase());
        } else if (doctorId != null) {
            results = appointmentRepository.findByDoctor_Id(doctorId);
        } else {
            results = appointmentRepository.findAll();
        }

        return results.stream().map(Mappers::toResponse).collect(Collectors.toList());
    }

    /* ── GET /api/appointments/{id} ── */
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(a -> ResponseEntity.ok(Mappers.toResponse(a)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── GET /api/appointments/patient/{patientId} ── */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getByPatient(@PathVariable Long patientId) {
        if (!patientRepository.existsById(patientId))
            return ResponseEntity.notFound().build();
        List<AppointmentResponse> list = appointmentRepository.findByPatient_Id(patientId)
                .stream().map(Mappers::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /* ── GET /api/appointments/doctor/{doctorId} ── */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getByDoctor(@PathVariable Long doctorId) {
        if (!doctorRepository.existsById(doctorId))
            return ResponseEntity.notFound().build();
        List<AppointmentResponse> list = appointmentRepository.findByDoctor_Id(doctorId)
                .stream().map(Mappers::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /* ── GET /api/appointments/doctor/{doctorId}/today ── */
    @GetMapping("/doctor/{doctorId}/today")
    public ResponseEntity<?> getDoctorTodayAppointments(@PathVariable Long doctorId) {
        if (!doctorRepository.existsById(doctorId))
            return ResponseEntity.notFound().build();
        String today = LocalDate.now().toString();
        List<AppointmentResponse> list = appointmentRepository
                .findByDoctor_IdAndAppointmentDate(doctorId, today)
                .stream().map(Mappers::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /* ── POST /api/appointments ── */
    @PostMapping
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        // Validate patient and doctor exist
        var patient = patientRepository.findById(request.patientId()).orElse(null);
        var doctor  = doctorRepository.findById(request.doctorId()).orElse(null);

        if (patient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Patient not found with id " + request.patientId()));
        }
        if (doctor == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor not found with id " + request.doctorId()));
        }

        // Check slot conflict
        List<Appointment> conflicts = appointmentRepository.findConflictingSlots(
                request.doctorId(), request.appointmentDate(), request.startTime());
        if (!conflicts.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This time slot is already booked for the selected doctor"));
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.appointmentDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .reason(request.reason() != null ? request.reason() : "General Consultation")
                .consultationType(request.consultationType().toUpperCase())
                .status("BOOKED")
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(Mappers.toResponse(saved));
    }

    /* ── PATCH /api/appointments/{id}/status ── */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || !VALID_STATUSES.contains(status.toUpperCase())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid status. Must be one of: " + VALID_STATUSES));
        }
        return appointmentRepository.findById(id).<ResponseEntity<?>>map(appointment -> {
            appointment.setStatus(status.toUpperCase());
            return ResponseEntity.ok(Mappers.toResponse(appointmentRepository.save(appointment)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── PATCH /api/appointments/{id}/reschedule ── */
    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<?> reschedule(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String date      = body.get("appointmentDate");
        String startTime = body.get("startTime");
        String endTime   = body.get("endTime");

        if (date == null || startTime == null || endTime == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Fields 'appointmentDate', 'startTime', and 'endTime' are required"));
        }

        return appointmentRepository.findById(id).<ResponseEntity<?>>map(appointment -> {
            // Check for slot conflict (exclude current appointment)
            List<Appointment> conflicts = appointmentRepository.findConflictingSlots(
                    appointment.getDoctor().getId(), date, startTime);
            boolean hasConflict = conflicts.stream().anyMatch(c -> !c.getId().equals(id));
            if (hasConflict) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "The selected time slot is not available"));
            }
            appointment.setAppointmentDate(date);
            appointment.setStartTime(startTime);
            appointment.setEndTime(endTime);
            appointment.setStatus("CONFIRMED");
            return ResponseEntity.ok(Mappers.toResponse(appointmentRepository.save(appointment)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── DELETE /api/appointments/{id} ── */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id).<ResponseEntity<?>>map(appointment -> {
            appointment.setStatus("CANCELLED");
            appointmentRepository.save(appointment);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
