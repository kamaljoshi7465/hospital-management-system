package com.hospital.hospital_management_system.controller;

import com.hospital.hospital_management_system.entity.User;
import com.hospital.hospital_management_system.repository.UserRepository;
import com.hospital.hospital_management_system.repository.PatientRepository;
import com.hospital.hospital_management_system.repository.DoctorRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final PatientRepository patientRepository;
	private final DoctorRepository doctorRepository;

	public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder,
			PatientRepository patientRepository, DoctorRepository doctorRepository) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.patientRepository = patientRepository;
		this.doctorRepository = doctorRepository;
	}
	public record UserSummary(Long id, String name, String email, String role) {}

	public record UserRequest(
			@NotBlank(message = "Name is required") @Size(max = 100, message = "Name must be at most 100 characters") String name,
			@NotBlank(message = "Email is required") @Email(message = "Enter a valid email") @Size(max = 150, message = "Email must be at most 150 characters") String email,
			@NotBlank(message = "Role is required") @Pattern(regexp = "ADMIN|DOCTOR|RECEPTIONIST|PATIENT", flags = Pattern.Flag.CASE_INSENSITIVE) String role,
			@Size(min = 12, max = 72, message = "Password must be between 12 and 72 characters") String password) {
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public List<UserSummary> getAllUsers(@RequestParam(required = false) String role) {
		if (role != null && !role.isBlank()) {
			return userRepository.findByRoleIgnoreCase(role.trim()).stream().map(UserController::summary).toList();
		}
		return userRepository.findAll().stream().map(UserController::summary).toList();
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<UserSummary> getUserById(@PathVariable Long id) {
		return userRepository.findById(id).map(UserController::summary).map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<?> createUser(@Valid @RequestBody UserRequest request) {
		if (request.password() == null || request.password().isBlank()) return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
		if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) return ResponseEntity.badRequest().body(Map.of("message", "Password must be at most 72 UTF-8 bytes"));
		if (userRepository.existsByEmailIgnoreCase(request.email())) {
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(Map.of("message", "Email already exists"));
		}

		User user = new User();
		apply(request, user);
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		return ResponseEntity.status(HttpStatus.CREATED).body(summary(userRepository.save(user)));
	}

	@PutMapping("/{id}")
	@Transactional
	public ResponseEntity<?> updateUser(@PathVariable Long id,
			@Valid @RequestBody UserRequest request) {
		return userRepository.findById(id).<ResponseEntity<?>>map(user -> {
			if (!user.getEmail().equalsIgnoreCase(request.email())
					&& userRepository.existsByEmailIgnoreCase(request.email())) {
				return ResponseEntity.status(HttpStatus.CONFLICT)
						.body(Map.of("message", "Email already exists"));
			}
			String newRole = request.role().trim().toUpperCase();
			if (patientRepository.existsByUserId(id) && !"PATIENT".equals(newRole)) return ResponseEntity.badRequest().body(Map.of("message", "A user linked to a patient profile must keep the PATIENT role"));
			if (doctorRepository.existsByUserId(id) && !"DOCTOR".equals(newRole)) return ResponseEntity.badRequest().body(Map.of("message", "A user linked to a doctor profile must keep the DOCTOR role"));
			apply(request, user);
			if (request.password() != null && !request.password().isBlank()) {
				if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) return ResponseEntity.badRequest().body(Map.of("message", "Password must be at most 72 UTF-8 bytes"));
				user.setPasswordHash(passwordEncoder.encode(request.password()));
			}
			patientRepository.findByUserId(id).ifPresent(patient -> { patient.setFullName(user.getName()); patient.setEmail(user.getEmail()); patientRepository.save(patient); });
			doctorRepository.findByUserId(id).ifPresent(doctor -> { doctor.setName(user.getName()); doctor.setEmail(user.getEmail()); doctorRepository.save(doctor); });
			return ResponseEntity.ok(summary(userRepository.save(user)));
		}).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		if (!userRepository.existsById(id))
			return ResponseEntity.notFound().build();
		if (patientRepository.existsByUserId(id) || doctorRepository.existsByUserId(id)) return ResponseEntity.status(HttpStatus.CONFLICT).build();
		userRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	private static void apply(UserRequest request, User user) {
		user.setName(request.name().trim());
		user.setEmail(request.email().trim().toLowerCase());
		user.setRole(request.role().trim().toUpperCase());
	}
	private static UserSummary summary(User user) { return new UserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole()); }
}
