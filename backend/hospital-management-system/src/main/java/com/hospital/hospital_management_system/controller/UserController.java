package com.hospital.hospital_management_system.controller;

import com.hospital.hospital_management_system.entity.User;
import com.hospital.hospital_management_system.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserRepository userRepository;

	public UserController(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public record UserRequest(
			@NotBlank(message = "Name is required") @Size(max = 100, message = "Name must be at most 100 characters") String name,
			@NotBlank(message = "Email is required") @Email(message = "Enter a valid email") @Size(max = 150, message = "Email must be at most 150 characters") String email,
			@NotBlank(message = "Role is required") @Size(max = 30, message = "Role must be at most 30 characters") String role) {
	}

	@GetMapping
	public List<User> getAllUsers(@RequestParam(required = false) String role) {
		if (role != null && !role.isBlank()) {
			return userRepository.findByRoleIgnoreCase(role.trim());
		}
		return userRepository.findAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<User> getUserById(@PathVariable Long id) {
		return userRepository.findById(id).map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<?> createUser(@Valid @RequestBody UserRequest request) {
		if (userRepository.existsByEmailIgnoreCase(request.email())) {
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(Map.of("message", "Email already exists"));
		}

		User user = new User();
		apply(request, user);
		return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(user));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> updateUser(@PathVariable Long id,
			@Valid @RequestBody UserRequest request) {
		return userRepository.findById(id).<ResponseEntity<?>>map(user -> {
			if (!user.getEmail().equalsIgnoreCase(request.email())
					&& userRepository.existsByEmailIgnoreCase(request.email())) {
				return ResponseEntity.status(HttpStatus.CONFLICT)
						.body(Map.of("message", "Email already exists"));
			}
			apply(request, user);
			return ResponseEntity.ok(userRepository.save(user));
		}).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		if (!userRepository.existsById(id))
			return ResponseEntity.notFound().build();
		userRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	private static void apply(UserRequest request, User user) {
		user.setName(request.name().trim());
		user.setEmail(request.email().trim().toLowerCase());
		user.setRole(request.role().trim().toUpperCase());
	}
}
