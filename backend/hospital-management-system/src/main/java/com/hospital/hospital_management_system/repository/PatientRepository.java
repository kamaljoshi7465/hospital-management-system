package com.hospital.hospital_management_system.repository;

import com.hospital.hospital_management_system.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<Patient> findByEmailIgnoreCase(String email);

    @Query("SELECT p FROM Patient p WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Patient> search(@Param("q") String query);

    Optional<Patient> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
