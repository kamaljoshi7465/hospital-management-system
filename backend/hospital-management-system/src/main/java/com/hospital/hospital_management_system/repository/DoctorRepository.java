package com.hospital.hospital_management_system.repository;

import com.hospital.hospital_management_system.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<Doctor> findByEmailIgnoreCase(String email);

    List<Doctor> findBySpecializationIgnoreCase(String specialization);

    List<Doctor> findByAvailableTrue();

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Doctor> search(@Param("q") String query);

    List<Doctor> findBySpecializationIgnoreCaseAndAvailableTrue(String specialization);

    Optional<Doctor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
    boolean existsByIdAndUser_Id(Long id, Long userId);
}
