package com.hospital.hospital_management_system.controller;

import com.hospital.hospital_management_system.dto.PatientRequest;
import com.hospital.hospital_management_system.dto.PatientResponse;
import com.hospital.hospital_management_system.dto.MedicationRequest;
import com.hospital.hospital_management_system.entity.Medication;
import com.hospital.hospital_management_system.entity.Patient;
import com.hospital.hospital_management_system.repository.MedicationRepository;
import com.hospital.hospital_management_system.repository.PatientRepository;
import com.hospital.hospital_management_system.repository.UserRepository;
import com.hospital.hospital_management_system.service.Mappers;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for the /api/patients module.
 *
 * Patient endpoints:
 *   GET    /api/patients                          → list all (optional search)
 *   GET    /api/patients/{id}                     → get by ID
 *   POST   /api/patients                          → register patient
 *   PUT    /api/patients/{id}                     → full update
 *   DELETE /api/patients/{id}                     → delete
 *
 * Vitals sub-resource:
 *   PUT    /api/patients/{id}/vitals              → update vitals
 *
 * Medications sub-resource:
 *   GET    /api/patients/{id}/medications         → list medications
 *   POST   /api/patients/{id}/medications         → add medication
 *   PUT    /api/patients/{patientId}/medications/{medId}  → update medication
 *   DELETE /api/patients/{patientId}/medications/{medId}  → delete medication
 */
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final MedicationRepository medicationRepository;
    private final UserRepository userRepository;

    public PatientController(
            PatientRepository patientRepository,
            MedicationRepository medicationRepository,
            UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.medicationRepository = medicationRepository;
        this.userRepository = userRepository;
    }

    /* ── GET /api/patients ── */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients(@RequestParam(required = false) String q) {
        List<Patient> patients = (q != null && !q.isBlank())
                ? patientRepository.search(q.trim())
                : patientRepository.findAll();

        return patients.stream().map(Mappers::toResponse).collect(Collectors.toList());
    }

    /* ── GET /api/patients/{id} ── */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR') or @authz.patientOwner(#id, authentication)")
    @Transactional(readOnly = true)
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(p -> ResponseEntity.ok(Mappers.toResponse(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── GET /api/patients/user/{userId} ── */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST') or @authz.patientUserOwner(#userId, authentication)")
    @Transactional(readOnly = true)
    public ResponseEntity<PatientResponse> getPatientByUserId(@PathVariable Long userId) {
        return patientRepository.findByUserId(userId)
                .map(p -> ResponseEntity.ok(Mappers.toResponse(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── POST /api/patients ── */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<?> createPatient(@Valid @RequestBody PatientRequest request) {
        if (patientRepository.existsByEmailIgnoreCase(request.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "A patient with this email already exists"));
        }

        Patient patient = new Patient();
        Mappers.applyRequest(request, patient);
        if (request.userId() != null) {
            var userOpt = userRepository.findById(request.userId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "User with ID " + request.userId() + " not found"));
            }
            if (!"PATIENT".equalsIgnoreCase(userOpt.get().getRole())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Linked user must have the PATIENT role"));
            }
            if (patientRepository.existsByUserId(request.userId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "A patient profile is already linked to user ID " + request.userId()));
            }
            patient.setUser(userOpt.get());
        } else {
            userRepository.findByEmailIgnoreCase(patient.getEmail()).ifPresent(u -> {
                if ("PATIENT".equalsIgnoreCase(u.getRole()) && !patientRepository.existsByUserId(u.getId())) {
                    patient.setUser(u);
                }
            });
        }
        Patient saved = patientRepository.save(patient);
        return ResponseEntity.status(HttpStatus.CREATED).body(Mappers.toResponse(saved));
    }

    /* ── PUT /api/patients/{id} ── */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST') or @authz.patientOwner(#id, authentication)")
    @Transactional
    public ResponseEntity<?> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest request,
            Authentication authentication) {
        return patientRepository.findById(id).<ResponseEntity<?>>map(patient -> {
            if (!patient.getEmail().equalsIgnoreCase(request.email())
                    && patientRepository.existsByEmailIgnoreCase(request.email())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email already in use by another patient"));
            }
            Mappers.applyRequest(request, patient);
            boolean staffMayLink = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_RECEPTIONIST"));
            if (request.userId() != null && staffMayLink) {
                var userOpt = userRepository.findById(request.userId());
                if (userOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "User with ID " + request.userId() + " not found"));
                }
                if (!"PATIENT".equalsIgnoreCase(userOpt.get().getRole())) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Linked user must have the PATIENT role"));
                }
                var existing = patientRepository.findByUserId(request.userId());
                if (existing.isPresent() && !existing.get().getId().equals(id)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("message", "User ID " + request.userId() + " is already linked to another patient"));
                }
                patient.setUser(userOpt.get());
            }
            if (patient.getUser() != null) {
                var account = patient.getUser();
                var duplicate = userRepository.findByEmailIgnoreCase(request.email());
                if (duplicate.isPresent() && !duplicate.get().getId().equals(account.getId())) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already belongs to another account"));
                }
                account.setName(request.fullName().trim()); account.setEmail(request.email().trim().toLowerCase());
                userRepository.save(account);
            }
            return ResponseEntity.ok(Mappers.toResponse(patientRepository.save(patient)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── DELETE /api/patients/{id} ── */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        if (!patientRepository.existsById(id))
            return ResponseEntity.notFound().build();
        patientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /* ────────── Vitals sub-resource ────────── */

    @PutMapping("/{id}/vitals")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST') or @authz.patientOwner(#id, authentication)")
    public ResponseEntity<?> updateVitals(
            @PathVariable Long id,
            @RequestBody PatientRequest.VitalsRequest vitals) {
        return patientRepository.findById(id).<ResponseEntity<?>>map(patient -> {
            if (vitals.bloodPressure() != null)  patient.setVitalsBloodPressure(vitals.bloodPressure());
            if (vitals.heartRate() != null)      patient.setVitalsHeartRate(vitals.heartRate());
            if (vitals.bloodSugar() != null)     patient.setVitalsBloodSugar(vitals.bloodSugar());
            if (vitals.weightKg() != null)       patient.setVitalsWeightKg(vitals.weightKg());
            if (vitals.heightCm() != null)       patient.setVitalsHeightCm(vitals.heightCm());
            if (vitals.temperatureF() != null)   patient.setVitalsTemperatureF(vitals.temperatureF());
            patient.setVitalsLastUpdated(LocalDate.now());
            return ResponseEntity.ok(Mappers.toResponse(patientRepository.save(patient)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ────────── Medications sub-resource ────────── */

    @GetMapping("/{id}/medications")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR') or @authz.patientOwner(#id, authentication)")
    public ResponseEntity<?> getMedications(@PathVariable Long id) {
        if (!patientRepository.existsById(id))
            return ResponseEntity.notFound().build();

        List<PatientResponse.MedicationInfo> meds = medicationRepository.findByPatient_Id(id).stream()
                .map(m -> new PatientResponse.MedicationInfo(
                        m.getId(), m.getName(), m.getDosage(),
                        m.getFrequency(), m.getDoctorName(), m.getRefillStatus()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(meds);
    }

    @PostMapping("/{id}/medications")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<?> addMedication(
            @PathVariable Long id,
            @Valid @RequestBody MedicationRequest request) {
        return patientRepository.findById(id).<ResponseEntity<?>>map(patient -> {
            Medication med = Medication.builder()
                    .patient(patient)
                    .name(request.name().trim())
                    .dosage(request.dosage())
                    .frequency(request.frequency())
                    .doctorName(request.doctorName())
                    .refillStatus(request.refillStatus() != null ? request.refillStatus().toUpperCase() : "ACTIVE")
                    .build();
            Medication saved = medicationRepository.save(med);
            PatientResponse.MedicationInfo info = new PatientResponse.MedicationInfo(
                    saved.getId(), saved.getName(), saved.getDosage(),
                    saved.getFrequency(), saved.getDoctorName(), saved.getRefillStatus());
            return ResponseEntity.status(HttpStatus.CREATED).body(info);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{patientId}/medications/{medId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<?> updateMedication(
            @PathVariable Long patientId,
            @PathVariable Long medId,
            @Valid @RequestBody MedicationRequest request) {
        if (!patientRepository.existsById(patientId))
            return ResponseEntity.notFound().build();

        return medicationRepository.findById(medId).<ResponseEntity<?>>map(med -> {
            if (!med.getPatient().getId().equals(patientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Medication does not belong to this patient"));
            }
            med.setName(request.name().trim());
            med.setDosage(request.dosage());
            med.setFrequency(request.frequency());
            med.setDoctorName(request.doctorName());
            if (request.refillStatus() != null) med.setRefillStatus(request.refillStatus().toUpperCase());
            Medication saved = medicationRepository.save(med);
            PatientResponse.MedicationInfo info = new PatientResponse.MedicationInfo(
                    saved.getId(), saved.getName(), saved.getDosage(),
                    saved.getFrequency(), saved.getDoctorName(), saved.getRefillStatus());
            return ResponseEntity.ok(info);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{patientId}/medications/{medId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<Void> deleteMedication(
            @PathVariable Long patientId,
            @PathVariable Long medId) {
        if (!patientRepository.existsById(patientId))
            return ResponseEntity.notFound().build();

        return medicationRepository.findById(medId).<ResponseEntity<Void>>map(med -> {
            if (!med.getPatient().getId().equals(patientId))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            medicationRepository.deleteById(medId);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
