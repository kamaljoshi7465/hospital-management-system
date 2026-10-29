package com.hospital.hospital_management_system.service;

import com.hospital.hospital_management_system.dto.*;
import com.hospital.hospital_management_system.entity.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/** Pure static mapping utilities between entities and DTOs */
public final class Mappers {

	private Mappers() {
	}

	/* ─────────── Doctor ─────────── */

	public static DoctorResponse toResponse(Doctor d) {
		List<String> workingDays = d.getWorkingDays() == null || d.getWorkingDays().isBlank()
				? Collections.emptyList()
				: Arrays.asList(d.getWorkingDays().split(","));

		return new DoctorResponse(
				d.getId(),
				d.getUser() != null ? d.getUser().getId() : null,
				d.getName(),
				d.getEmail(),
				d.getPhone(),
				d.getSpecialization(),
				d.getQualification(),
				d.getExperienceYears(),
				d.getConsultationFee(),
				d.getRating(),
				d.getTotalReviews(),
				d.getBio(),
				d.getImage(),
				d.isAvailable(),
				workingDays,
				new DoctorResponse.WorkingHours(d.getWorkingHoursStart(), d.getWorkingHoursEnd()),
				d.getSlotDurationMinutes());
	}

	public static void applyRequest(DoctorRequest r, Doctor d) {
		d.setName(r.name().trim());
		d.setEmail(r.email().trim().toLowerCase());
		d.setPhone(r.phone().trim());
		d.setSpecialization(r.specialization().trim());
		d.setQualification(r.qualification().trim());
		d.setExperienceYears(r.experienceYears());
		d.setConsultationFee(r.consultationFee());
		d.setRating(r.rating() != null ? r.rating() : d.getRating());
		d.setTotalReviews(r.totalReviews());
		d.setBio(r.bio());
		d.setImage(r.image());
		d.setAvailable(r.available());
		if (r.workingDays() != null) {
			d.setWorkingDays(String.join(",", r.workingDays()));
		}
		d.setWorkingHoursStart(r.workingHoursStart());
		d.setWorkingHoursEnd(r.workingHoursEnd());
		d.setSlotDurationMinutes(r.slotDurationMinutes() > 0 ? r.slotDurationMinutes() : 30);
	}

	/* ─────────── Patient ─────────── */

	public static PatientResponse toResponse(Patient p) {
		PatientResponse.PatientAddress address = new PatientResponse.PatientAddress(
				p.getAddressCity(), p.getAddressState(), p.getAddressCountry());

		PatientResponse.EmergencyContact ec = (p.getEmergencyContactName() != null)
				? new PatientResponse.EmergencyContact(
						p.getEmergencyContactName(),
						p.getEmergencyContactRelationship(),
						p.getEmergencyContactPhone())
				: null;

		PatientResponse.PatientVitals vitals = null;
		if (p.getVitalsBloodPressure() != null || p.getVitalsHeartRate() != null) {
			vitals = new PatientResponse.PatientVitals(
					p.getVitalsBloodPressure(),
					p.getVitalsHeartRate(),
					p.getVitalsBloodSugar(),
					p.getVitalsWeightKg(),
					p.getVitalsHeightCm(),
					p.getVitalsTemperatureF(),
					p.getVitalsLastUpdated() != null ? p.getVitalsLastUpdated().toString() : null);
		}

		List<String> allergies = splitCsv(p.getAllergies());
		List<String> chronic = splitCsv(p.getChronicConditions());

		List<PatientResponse.MedicationInfo> meds = p.getMedications().stream()
				.map(m -> new PatientResponse.MedicationInfo(
						m.getId(), m.getName(), m.getDosage(),
						m.getFrequency(), m.getDoctorName(), m.getRefillStatus()))
				.collect(Collectors.toList());

		return new PatientResponse(
				p.getId(),
				p.getUser() != null ? p.getUser().getId() : null,
				p.getFullName(),
				p.getEmail(),
				p.getPhone(),
				p.getDateOfBirth().toString(),
				p.getGender(),
				p.getBloodGroup(),
				address,
				p.getCreatedAt() != null ? p.getCreatedAt().toString() : null,
				ec,
				allergies,
				chronic,
				vitals,
				meds);
	}

	public static void applyRequest(PatientRequest r, Patient p) {
		p.setFullName(r.fullName().trim());
		p.setEmail(r.email().trim().toLowerCase());
		p.setPhone(r.phone().trim());
		p.setDateOfBirth(java.time.LocalDate.parse(r.dateOfBirth()));
		p.setGender(r.gender().toUpperCase());
		p.setBloodGroup(r.bloodGroup());

		if (r.address() != null) {
			p.setAddressCity(r.address().city());
			p.setAddressState(r.address().state());
			p.setAddressCountry(r.address().country());
		}
		if (r.emergencyContact() != null) {
			p.setEmergencyContactName(r.emergencyContact().name());
			p.setEmergencyContactRelationship(r.emergencyContact().relationship());
			p.setEmergencyContactPhone(r.emergencyContact().phone());
		}
		if (r.allergies() != null) {
			p.setAllergies(String.join(",", r.allergies()));
		}
		if (r.chronicConditions() != null) {
			p.setChronicConditions(String.join(",", r.chronicConditions()));
		}
		if (r.vitals() != null) {
			PatientRequest.VitalsRequest v = r.vitals();
			p.setVitalsBloodPressure(v.bloodPressure());
			p.setVitalsHeartRate(v.heartRate());
			p.setVitalsBloodSugar(v.bloodSugar());
			p.setVitalsWeightKg(v.weightKg());
			p.setVitalsHeightCm(v.heightCm());
			p.setVitalsTemperatureF(v.temperatureF());
			p.setVitalsLastUpdated(java.time.LocalDate.now());
		}
	}

	/* ─────────── Appointment ─────────── */

	public static AppointmentResponse toResponse(Appointment a) {
		AppointmentResponse.PatientSummary ps = a.getPatient() != null
				? new AppointmentResponse.PatientSummary(
						a.getPatient().getId(), a.getPatient().getFullName(),
						a.getPatient().getEmail(), a.getPatient().getPhone())
				: null;

		AppointmentResponse.DoctorSummary ds = a.getDoctor() != null
				? new AppointmentResponse.DoctorSummary(
						a.getDoctor().getId(), a.getDoctor().getName(),
						a.getDoctor().getSpecialization(), a.getDoctor().getEmail(),
						a.getDoctor().getPhone())
				: null;

		return new AppointmentResponse(
				a.getId(),
				a.getPatient() != null ? a.getPatient().getId() : null,
				a.getDoctor() != null ? a.getDoctor().getId() : null,
				a.getAppointmentDate(),
				a.getStartTime(),
				a.getEndTime(),
				a.getStatus(),
				a.getReason(),
				a.getConsultationType(),
				a.getCreatedAt() != null ? a.getCreatedAt().toString() : null,
				ps,
				ds);
	}

	/* ─────────── Helpers ─────────── */

	private static List<String> splitCsv(String csv) {
		if (csv == null || csv.isBlank())
			return Collections.emptyList();
		return Arrays.stream(csv.split(","))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.collect(Collectors.toList());
	}
}
