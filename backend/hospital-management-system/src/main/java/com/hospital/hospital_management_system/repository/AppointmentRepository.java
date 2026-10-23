package com.hospital.hospital_management_system.repository;

import com.hospital.hospital_management_system.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient_Id(Long patientId);

    List<Appointment> findByDoctor_Id(Long doctorId);

    List<Appointment> findByDoctor_IdAndAppointmentDate(Long doctorId, String appointmentDate);

    List<Appointment> findByPatient_IdAndStatus(Long patientId, String status);

    List<Appointment> findByDoctor_IdAndStatus(Long doctorId, String status);

    boolean existsByDoctor_IdAndAppointmentDateAndStartTimeAndStatusNot(
            Long doctorId, String appointmentDate, String startTime, String status);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate = :date AND a.startTime = :startTime " +
            "AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    List<Appointment> findConflictingSlots(
            @Param("doctorId") Long doctorId,
            @Param("date") String date,
            @Param("startTime") String startTime);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId " +
            "AND a.appointmentDate >= :fromDate ORDER BY a.appointmentDate, a.startTime")
    List<Appointment> findUpcomingByPatient(@Param("patientId") Long patientId, @Param("fromDate") String fromDate);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate >= :fromDate ORDER BY a.appointmentDate, a.startTime")
    List<Appointment> findUpcomingByDoctor(@Param("doctorId") Long doctorId, @Param("fromDate") String fromDate);
}
