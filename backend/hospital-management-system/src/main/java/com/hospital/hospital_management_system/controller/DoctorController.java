package com.hospital.hospital_management_system.controller;

import com.hospital.hospital_management_system.dto.DoctorRequest;
import com.hospital.hospital_management_system.dto.DoctorResponse;
import com.hospital.hospital_management_system.entity.Doctor;
import com.hospital.hospital_management_system.repository.DoctorRepository;
import com.hospital.hospital_management_system.repository.UserRepository;
import com.hospital.hospital_management_system.service.Mappers;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for the /api/doctors module.
 *
 * Endpoints:
 *   GET    /api/doctors                        → list all (with optional filters)
 *   GET    /api/doctors/{id}                   → get by ID
 *   POST   /api/doctors                        → create
 *   PUT    /api/doctors/{id}                   → full update
 *   PATCH  /api/doctors/{id}/availability      → toggle available flag
 *   DELETE /api/doctors/{id}                   → delete
 */
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorController(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    /* ── GET /api/doctors ── */
    @GetMapping
    @Transactional(readOnly = true)
    public List<DoctorResponse> getAllDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean available
    ) {
        List<Doctor> doctors;

        if (q != null && !q.isBlank()) {
            doctors = doctorRepository.search(q.trim());
        } else if (specialization != null && !specialization.isBlank()) {
            if (Boolean.TRUE.equals(available)) {
                doctors = doctorRepository.findBySpecializationIgnoreCaseAndAvailableTrue(specialization);
            } else {
                doctors = doctorRepository.findBySpecializationIgnoreCase(specialization);
            }
        } else if (Boolean.TRUE.equals(available)) {
            doctors = doctorRepository.findByAvailableTrue();
        } else {
            doctors = doctorRepository.findAll();
        }

        return doctors.stream().map(Mappers::toResponse).collect(Collectors.toList());
    }

    /* ── GET /api/doctors/{id} ── */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long id) {
        return doctorRepository.findById(id)
                .map(d -> ResponseEntity.ok(Mappers.toResponse(d)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── GET /api/doctors/user/{userId} ── */
    @GetMapping("/user/{userId}")
    @Transactional(readOnly = true)
    public ResponseEntity<DoctorResponse> getDoctorByUserId(@PathVariable Long userId) {
        return doctorRepository.findByUserId(userId)
                .map(d -> ResponseEntity.ok(Mappers.toResponse(d)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── POST /api/doctors ── */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDoctor(@Valid @RequestBody DoctorRequest request) {
        if (doctorRepository.existsByEmailIgnoreCase(request.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "A doctor with this email already exists"));
        }

        Doctor doctor = new Doctor();
        Mappers.applyRequest(request, doctor);
        if (request.userId() != null) {
            var userOpt = userRepository.findById(request.userId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "User with ID " + request.userId() + " not found"));
            }
            if (!"DOCTOR".equalsIgnoreCase(userOpt.get().getRole())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Linked user must have the DOCTOR role"));
            }
            if (doctorRepository.existsByUserId(request.userId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "A doctor profile is already linked to user ID " + request.userId()));
            }
            doctor.setUser(userOpt.get());
        } else {
            userRepository.findByEmailIgnoreCase(doctor.getEmail()).ifPresent(u -> {
                if ("DOCTOR".equalsIgnoreCase(u.getRole()) && !doctorRepository.existsByUserId(u.getId())) {
                    doctor.setUser(u);
                }
            });
        }
        Doctor saved = doctorRepository.save(doctor);
        return ResponseEntity.status(HttpStatus.CREATED).body(Mappers.toResponse(saved));
    }

    /* ── PUT /api/doctors/{id} ── */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authz.doctorOwner(#id, authentication)")
    @Transactional
    public ResponseEntity<?> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequest request,
            Authentication authentication) {
        return doctorRepository.findById(id).<ResponseEntity<?>>map(doctor -> {
            if (!doctor.getEmail().equalsIgnoreCase(request.email())
                    && doctorRepository.existsByEmailIgnoreCase(request.email())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email already in use by another doctor"));
            }
            Mappers.applyRequest(request, doctor);
            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (request.userId() != null && isAdmin) {
                var userOpt = userRepository.findById(request.userId());
                if (userOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "User with ID " + request.userId() + " not found"));
                }
                if (!"DOCTOR".equalsIgnoreCase(userOpt.get().getRole())) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Linked user must have the DOCTOR role"));
                }
                var existing = doctorRepository.findByUserId(request.userId());
                if (existing.isPresent() && !existing.get().getId().equals(id)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("message", "User ID " + request.userId() + " is already linked to another doctor"));
                }
                doctor.setUser(userOpt.get());
            }
            if (doctor.getUser() != null) {
                var account = doctor.getUser();
                var duplicate = userRepository.findByEmailIgnoreCase(request.email());
                if (duplicate.isPresent() && !duplicate.get().getId().equals(account.getId())) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already belongs to another account"));
                }
                account.setName(request.name().trim()); account.setEmail(request.email().trim().toLowerCase());
                userRepository.save(account);
            }
            return ResponseEntity.ok(Mappers.toResponse(doctorRepository.save(doctor)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── PATCH /api/doctors/{id}/availability ── */
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN') or @authz.doctorOwner(#id, authentication)")
    public ResponseEntity<?> toggleAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean available = body.get("available");
        if (available == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Field 'available' is required"));
        }
        return doctorRepository.findById(id).<ResponseEntity<?>>map(doctor -> {
            doctor.setAvailable(available);
            return ResponseEntity.ok(Mappers.toResponse(doctorRepository.save(doctor)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ── DELETE /api/doctors/{id} ── */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        if (!doctorRepository.existsById(id))
            return ResponseEntity.notFound().build();
        doctorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
