package com.hospital.hospital_management_system.repository;

import com.hospital.hospital_management_system.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctor_Id(Long doctorId);

    Optional<DoctorAvailability> findByDoctor_IdAndDayOfWeek(Long doctorId, String dayOfWeek);

    void deleteByDoctor_Id(Long doctorId);
}
