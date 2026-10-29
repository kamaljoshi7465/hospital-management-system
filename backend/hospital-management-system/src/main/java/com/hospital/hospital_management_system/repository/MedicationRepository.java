package com.hospital.hospital_management_system.repository;

import com.hospital.hospital_management_system.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicationRepository extends JpaRepository<Medication, Long> {

    List<Medication> findByPatient_Id(Long patientId);

    List<Medication> findByPatient_IdAndRefillStatus(Long patientId, String refillStatus);
}
