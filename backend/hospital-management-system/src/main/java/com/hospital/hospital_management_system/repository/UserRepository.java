package com.hospital.hospital_management_system.repository;

import com.hospital.hospital_management_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    java.util.List<User> findByRoleIgnoreCase(String role);
}
