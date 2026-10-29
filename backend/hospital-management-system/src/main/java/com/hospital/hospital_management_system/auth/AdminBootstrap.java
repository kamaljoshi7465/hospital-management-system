package com.hospital.hospital_management_system.auth;

import com.hospital.hospital_management_system.entity.User;
import com.hospital.hospital_management_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final String email;
    private final String password;
    public AdminBootstrap(UserRepository users, PasswordEncoder passwords,
                          @Value("${app.bootstrap-admin.email:}") String email,
                          @Value("${app.bootstrap-admin.password:}") String password) {
        this.users = users; this.passwords = passwords; this.email = email; this.password = password;
    }
    @EventListener(ApplicationReadyEvent.class)
    public void createInitialAdminIfConfigured() {
        if (email.isBlank() && password.isBlank()) return;
        if (email.isBlank() || password.length() < 12)
            throw new IllegalStateException("Set both ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD (at least 12 characters)");
        var existing = users.findByEmailIgnoreCase(email.trim());
        if (existing.isPresent()) {
            User current = existing.get();
            if (!"ADMIN".equalsIgnoreCase(current.getRole())) throw new IllegalStateException("Bootstrap email is already assigned to a non-admin user");
            if (current.getPasswordHash() == null || current.getPasswordHash().isBlank()) {
                current.setPasswordHash(passwords.encode(password)); users.save(current);
            }
            return;
        }
        User admin = new User(); admin.setName("System Administrator"); admin.setEmail(email.trim().toLowerCase());
        admin.setRole("ADMIN"); admin.setPasswordHash(passwords.encode(password)); users.save(admin);
    }
}
