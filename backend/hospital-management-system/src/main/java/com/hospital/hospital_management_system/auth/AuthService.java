package com.hospital.hospital_management_system.auth;

import com.hospital.hospital_management_system.entity.Patient;
import com.hospital.hospital_management_system.entity.User;
import com.hospital.hospital_management_system.repository.DoctorRepository;
import com.hospital.hospital_management_system.repository.PatientRepository;
import com.hospital.hospital_management_system.repository.UserRepository;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static com.hospital.hospital_management_system.auth.AuthDtos.*;

@Service
public class AuthService {
    private final UserRepository users;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final RevokedTokenRepository revokedTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long tokenTtlSeconds;
    private final String issuer;

    public AuthService(UserRepository users, PatientRepository patients, DoctorRepository doctors,
                       RevokedTokenRepository revokedTokens, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder,
                       @Value("${app.jwt.ttl-seconds:1800}") long tokenTtlSeconds,
                       @Value("${app.jwt.issuer:hospital-management-system}") String issuer) {
        this.users = users; this.patients = patients; this.doctors = doctors;
        this.revokedTokens = revokedTokens; this.passwordEncoder = passwordEncoder; this.jwtEncoder = jwtEncoder;
        if (tokenTtlSeconds < 60) throw new IllegalArgumentException("JWT_TTL_SECONDS must be at least 60 seconds");
        this.tokenTtlSeconds = tokenTtlSeconds; this.issuer = issuer;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at most 72 UTF-8 bytes");
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email) || patients.existsByEmailIgnoreCase(email))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        User user = new User();
        user.setName(request.name().trim()); user.setEmail(email); user.setRole("PATIENT");
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        users.save(user);

        Patient patient = new Patient();
        patient.setUser(user); patient.setFullName(user.getName()); patient.setEmail(email);
        patient.setPhone(request.phone().trim()); patient.setDateOfBirth(request.dateOfBirth());
        patient.setGender(request.gender()); patient.setBloodGroup(""); patient.setAddressCountry("India");
        patients.save(patient);
        return issue(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (user.getPasswordHash() == null || request.password().getBytes(StandardCharsets.UTF_8).length > 72
                || !passwordEncoder.matches(request.password(), user.getPasswordHash()))
            throw new BadCredentialsException("Invalid email or password");
        return issue(user);
    }

    @Transactional(readOnly = true)
    public AuthenticatedUser profile(Jwt jwt) {
        User user = users.findById(Long.valueOf(jwt.getSubject()))
                .orElseThrow(() -> new BadCredentialsException("Account is no longer available"));
        return toProfile(user);
    }

    @Transactional
    public void logout(Jwt jwt) {
        if (jwt.getId() != null && jwt.getExpiresAt() != null)
            revokedTokens.save(new RevokedToken(jwt.getId(), jwt.getExpiresAt()));
    }

    private AuthResponse issue(User user) {
        Instant now = Instant.now();
        String tokenId = UUID.randomUUID().toString();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer(issuer).issuedAt(now).expiresAt(now.plusSeconds(tokenTtlSeconds))
                .id(tokenId).subject(user.getId().toString()).claim("roles", java.util.List.of(user.getRole())).build();
        // Nimbus needs the signing algorithm in the JOSE header to select the
        // matching key from the configured JWK source.
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new AuthResponse(token, "Bearer", tokenTtlSeconds, toProfile(user));
    }

    private AuthenticatedUser toProfile(User user) {
        Long patientId = patients.findByUserId(user.getId()).map(Patient::getId).orElse(null);
        Long doctorId = doctors.findByUserId(user.getId()).map(d -> d.getId()).orElse(null);
        return new AuthenticatedUser(user.getId(), user.getName(), user.getEmail(), user.getRole(), patientId, doctorId);
    }
}
