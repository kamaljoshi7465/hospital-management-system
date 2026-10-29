import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppointmentsQuery, useDoctorsQuery, useHospitalMutations, usePatientQuery, usePatientsQuery, queryKeys } from "../hooks/useHospitalApi";
import { useAuth } from "./AuthContext";
import type { Doctor, Appointment, Patient, ConsultationType, AppointmentStatus, PatientVitals } from "../types";

export interface Toast { id: string; title: string; message: string; type: "success" | "info" | "warning" | "error" }
interface BookAppointmentInput { doctorId: number; appointmentDate: string; startTime: string; endTime: string; reason: string; consultationType: ConsultationType }
interface HospitalContextType {
  doctors: Doctor[]; appointments: Appointment[]; patients: Patient[]; loading: boolean; loadError: string | null;
  currentPatient: Patient; setCurrentPatientId: (id: number, silent?: boolean) => void; currentDoctor: Doctor; setCurrentDoctorId: (id: number, silent?: boolean) => void;
  updateDoctor: (id: number, updated: Partial<Doctor>) => Promise<boolean>; updateAppointmentStatus: (id: number, status: AppointmentStatus) => Promise<void>;
  bookAppointment: (input: BookAppointmentInput) => Promise<Appointment | null>; cancelAppointment: (id: number) => Promise<void>;
  rescheduleAppointment: (id: number, date: string, start: string, end: string) => Promise<void>;
  updatePatient: (updated: Partial<Patient>) => Promise<void>; updateVitals: (vitals: Partial<PatientVitals>) => Promise<void>; resetDemoData: () => void;
  toasts: Toast[]; addToast: (title: string, message: string, type?: Toast["type"]) => void; removeToast: (id: string) => void;
  activeVideoCall: Appointment | null; startVideoCall: (appointment: Appointment) => void; endVideoCall: () => void;
}
const HospitalContext = createContext<HospitalContextType | undefined>(undefined);
const patientKey = "medicare_patient_id_v1", doctorKey = "medicare_doctor_id_v1";
const safeId = (key: string) => { try { const v = localStorage.getItem(key); return v ? Number(v) : null; } catch { return null; } };
export function HospitalProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const qc = useQueryClient();
  const dQuery = useDoctorsQuery();
  const staffRole = auth.currentUser && ["admin", "receptionist", "doctor"].includes(auth.currentUser.role);
  const pQuery = usePatientsQuery(Boolean(staffRole));
  const ownPatientQuery = usePatientQuery(auth.currentUser?.patientId ?? 0);
  const appointmentsParams = auth.currentUser?.role === "patient" ? { patientId: auth.currentUser.patientId } : auth.currentUser?.role === "doctor" ? { doctorId: auth.currentUser.doctorId } : undefined;
  const aQuery = useAppointmentsQuery(appointmentsParams, Boolean(auth.currentUser));
  const mutations = useHospitalMutations();
  const doctors = dQuery.data ?? [], patients = pQuery.data ?? (ownPatientQuery.data ? [ownPatientQuery.data] : []), appointments = aQuery.data ?? [];
  const [patientOverride, setPatientOverride] = useState<number | null>(() => safeId(patientKey));
  const [doctorOverride, setDoctorOverride] = useState<number | null>(() => safeId(doctorKey));
  const patientId = patientOverride ?? auth.currentUser?.patientId;
  const doctorId = doctorOverride ?? auth.currentUser?.doctorId;
  const currentPatient = patients.find(p => p.id === patientId) ?? patients[0];
  const currentDoctor = doctors.find(d => d.id === doctorId) ?? doctors[0];
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeVideoCall, setActiveVideoCall] = useState<Appointment | null>(null);
  const addToast = useCallback((title: string, message: string, type: Toast["type"] = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(v => [...v, { id, title, message, type }]);
    window.setTimeout(() => setToasts(v => v.filter(t => t.id !== id)), 4500);
  }, []);
  const removeToast = useCallback((id: string) => setToasts(v => v.filter(t => t.id !== id)), []);
  const run = useCallback(async <T,>(action: () => Promise<T>, success: string, message: string, type: Toast["type"] = "success"): Promise<T | null> => {
    try { const value = await action(); addToast(success, message, type); return value; }
    catch (error) { addToast("Request failed", error instanceof Error ? error.message : "Please try again.", "error"); return null; }
  }, [addToast]);
  const value: HospitalContextType = {
    doctors, patients, appointments, loading: dQuery.isLoading || pQuery.isLoading || ownPatientQuery.isLoading || aQuery.isLoading,
    loadError: [dQuery.error, pQuery.error, ownPatientQuery.error, aQuery.error].find(Boolean) instanceof Error ? ([dQuery.error, pQuery.error, ownPatientQuery.error, aQuery.error].find(Boolean) as Error).message : null,
    currentPatient, currentDoctor,
    setCurrentPatientId: (id, silent = false) => { setPatientOverride(id); localStorage.setItem(patientKey, String(id)); if (!silent) addToast("Account Switched", `Viewing profile as ${patients.find(p => p.id === id)?.fullName ?? "patient"}`, "info"); },
    setCurrentDoctorId: (id, silent = false) => { setDoctorOverride(id); localStorage.setItem(doctorKey, String(id)); if (!silent) addToast("Workspace Switched", `Viewing workspace for ${doctors.find(d => d.id === id)?.name ?? "doctor"}`, "info"); },
    updateDoctor: async (id, updated) => { const result = await run(async () => { const doctor = doctors.find(d => d.id === id); if (!doctor) throw new Error("Doctor not found"); const hours = updated.workingHours ?? doctor.workingHours; const days = updated.workingDays ?? doctor.workingDays; const data = { name: updated.name ?? doctor.name, email: updated.email ?? doctor.email, phone: updated.phone ?? doctor.phone, specialization: updated.specialization ?? doctor.specialization, qualification: updated.qualification ?? doctor.qualification, experienceYears: updated.experienceYears ?? doctor.experienceYears, consultationFee: updated.consultationFee ?? doctor.consultationFee, rating: doctor.rating, totalReviews: doctor.totalReviews, bio: updated.bio ?? doctor.bio, image: updated.image ?? doctor.image, available: updated.available ?? doctor.available, workingDays: days, workingHoursStart: hours.start, workingHoursEnd: hours.end, slotDurationMinutes: updated.slotDurationMinutes ?? doctor.slotDurationMinutes }; await mutations.updateDoctor.mutateAsync({ id, data }); if (updated.workingDays || updated.workingHours || updated.slotDurationMinutes) await mutations.saveSchedule.mutateAsync({ id, days: days.map(day => ({ dayOfWeek: day.toUpperCase(), startTime: hours.start, endTime: hours.end, breaksJson: "[]", timezone: "Asia/Kolkata" })) }); }, "Profile updated", "Doctor profile and schedule settings were saved."); return result !== null; },
    updateAppointmentStatus: async (id, status) => { await run(() => mutations.updateAppointment.mutateAsync({ id, status }), "Status updated", `Appointment marked ${status.toLowerCase()}.`, "info"); },
    bookAppointment: async input => { if (!currentPatient) { addToast("Booking failed", "Patient profile is not available.", "error"); return null; } return run(() => mutations.createAppointment.mutateAsync({ ...input, patientId: currentPatient.id }), "Appointment booked", "Your appointment has been saved."); },
    cancelAppointment: async id => { await run(() => mutations.cancelAppointment.mutateAsync(id), "Appointment cancelled", "Your appointment has been cancelled.", "warning"); },
    rescheduleAppointment: async (id, date, start, end) => { await run(() => mutations.rescheduleAppointment.mutateAsync({ id, date, start, end }), "Appointment rescheduled", `Moved to ${date} at ${start}.`); },
    updatePatient: async updated => { if (!currentPatient) return; const data = { fullName: updated.fullName ?? currentPatient.fullName, email: updated.email ?? currentPatient.email, phone: updated.phone ?? currentPatient.phone, dateOfBirth: currentPatient.dateOfBirth, gender: updated.gender ?? currentPatient.gender, bloodGroup: updated.bloodGroup ?? currentPatient.bloodGroup, address: { ...currentPatient.address, ...updated.address }, emergencyContact: currentPatient.emergencyContact, allergies: currentPatient.allergies, chronicConditions: currentPatient.chronicConditions, vitals: currentPatient.vitals }; await run(() => mutations.updatePatient.mutateAsync({ id: currentPatient.id, data }), "Profile updated", "Your personal health records have been saved."); },
    updateVitals: async vitals => { if (!currentPatient) return; const data = { bloodPressure: vitals.bloodPressure ?? currentPatient.vitals?.bloodPressure, heartRate: vitals.heartRate ?? currentPatient.vitals?.heartRate, bloodSugar: vitals.bloodSugar ?? currentPatient.vitals?.bloodSugar, weightKg: vitals.weightKg ?? currentPatient.vitals?.weightKg, heightCm: vitals.heightCm ?? currentPatient.vitals?.heightCm, temperatureF: vitals.temperatureF ?? currentPatient.vitals?.temperatureF }; await run(() => mutations.updateVitals.mutateAsync({ id: currentPatient.id, data }), "Vitals logged", "Your latest health vitals have been recorded."); },
    resetDemoData: () => { setPatientOverride(null); setDoctorOverride(null); localStorage.removeItem(patientKey); localStorage.removeItem(doctorKey); addToast("Data refreshed", "Hospital data is managed by the server.", "info"); },
    toasts, addToast, removeToast, activeVideoCall, startVideoCall: setActiveVideoCall, endVideoCall: () => setActiveVideoCall(null),
  };
  if (value.loading) return <div className="flex min-h-screen items-center justify-center text-sm font-medium text-slate-600">Loading hospital data…</div>;
  if (value.loadError) return <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center"><p className="font-semibold text-rose-700">Could not load hospital data</p><p className="max-w-lg text-sm text-slate-600">{value.loadError}</p><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" onClick={() => { void qc.invalidateQueries({ queryKey: queryKeys.doctors }); void qc.invalidateQueries({ queryKey: queryKeys.patients }); void qc.invalidateQueries({ queryKey: queryKeys.appointments }); }}>Retry</button></div>;
  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useHospital(): HospitalContextType { const value = useContext(HospitalContext); if (!value) throw new Error("useHospital must be used within a HospitalProvider"); return value; }
