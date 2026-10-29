package com.hospital.hospital_management_system.auth;

import com.hospital.hospital_management_system.repository.AppointmentRepository;
import com.hospital.hospital_management_system.repository.DoctorRepository;
import com.hospital.hospital_management_system.repository.PatientRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component("authz")
public class AuthorizationService {
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;
    public AuthorizationService(PatientRepository patients, DoctorRepository doctors, AppointmentRepository appointments) {
        this.patients = patients; this.doctors = doctors; this.appointments = appointments;
    }
    private Long userId(Authentication auth) {
        return auth != null && auth.getPrincipal() instanceof Jwt jwt ? Long.valueOf(jwt.getSubject()) : null;
    }
    public boolean patientOwner(Long patientId, Authentication auth) {
        Long userId = userId(auth);
        return userId != null && patients.existsByIdAndUser_Id(patientId, userId);
    }
    public boolean doctorOwner(Long doctorId, Authentication auth) {
        Long userId = userId(auth);
        return userId != null && doctors.existsByIdAndUser_Id(doctorId, userId);
    }
    public boolean appointmentPatientOwner(Long appointmentId, Authentication auth) {
        Long userId = userId(auth);
        return userId != null && appointments.existsByIdAndPatient_User_Id(appointmentId, userId);
    }
    public boolean appointmentDoctorOwner(Long appointmentId, Authentication auth) {
        Long userId = userId(auth);
        return userId != null && appointments.existsByIdAndDoctor_User_Id(appointmentId, userId);
    }
    public boolean patientUserOwner(Long ownerUserId, Authentication auth) { return ownerUserId != null && ownerUserId.equals(userId(auth)); }
    public Long patientIdFor(Authentication auth) { Long id = userId(auth); return id == null ? null : patients.findByUserId(id).map(p -> p.getId()).orElse(null); }
    public Long doctorIdFor(Authentication auth) { Long id = userId(auth); return id == null ? null : doctors.findByUserId(id).map(d -> d.getId()).orElse(null); }
}
