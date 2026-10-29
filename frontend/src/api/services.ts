import { del, get, patch, post, put } from "./client";
import { endpoints as e } from "./endpoints";
import type { Appointment, AppointmentStatus, Doctor, Patient } from "../types";

export interface UserRecord { id: number; name: string; email: string; role: string }
export interface AvailabilityRecord { id?: number; doctorId: number; dayOfWeek: string; startTime: string; endTime: string; breaksJson?: string; timezone?: string }
export interface MedicationRecord { id: number; name: string; dosage: string; frequency: string; doctor: string; refillStatus: string }
export type AppointmentCreate = Omit<Appointment, "id" | "status" | "createdAt">;
const normalizePatient = (patient: Patient): Patient => ({
  ...patient,
  medications: patient.medications?.map(m => ({ ...m, id: String(m.id), refillStatus: ({ ACTIVE: "Active", REFILL_DUE: "Refill Due", COMPLETED: "Completed" }[m.refillStatus.toUpperCase()] ?? m.refillStatus) as "Active" | "Refill Due" | "Completed" })),
});

export const usersApi = {
  list: (role?: string) => get<UserRecord[]>(`${e.users}${role ? `?role=${encodeURIComponent(role)}` : ""}`),
  get: (id: number) => get<UserRecord>(e.user(id)), create: (data: unknown) => post<UserRecord>(e.users, data),
  update: (id: number, data: unknown) => put<UserRecord>(e.user(id), data), remove: (id: number) => del(e.user(id)),
};
export const patientsApi = {
  list: async (q?: string) => (await get<Patient[]>(`${e.patients}${q ? `?q=${encodeURIComponent(q)}` : ""}`)).map(normalizePatient),
  get: async (id: number) => normalizePatient(await get<Patient>(e.patient(id))), getByUser: async (id: number) => normalizePatient(await get<Patient>(e.patientByUser(id))),
  create: async (data: unknown) => normalizePatient(await post<Patient>(e.patients, data)), update: async (id: number, data: unknown) => normalizePatient(await put<Patient>(e.patient(id), data)), remove: (id: number) => del(e.patient(id)),
  updateVitals: async (id: number, data: unknown) => normalizePatient(await put<Patient>(e.patientVitals(id), data)),
  medications: (id: number) => get<MedicationRecord[]>(e.medications(id)),
  addMedication: (id: number, data: unknown) => post<MedicationRecord>(e.medications(id), data),
  updateMedication: (id: number, medId: number, data: unknown) => put<MedicationRecord>(e.medication(id, medId), data),
  removeMedication: (id: number, medId: number) => del(e.medication(id, medId)),
};
export const doctorsApi = {
  list: (q?: string) => get<Doctor[]>(`${e.doctors}${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  get: (id: number) => get<Doctor>(e.doctor(id)), getByUser: (id: number) => get<Doctor>(e.doctorByUser(id)),
  create: (data: unknown) => post<Doctor>(e.doctors, data), update: (id: number, data: unknown) => put<Doctor>(e.doctor(id), data),
  setAvailability: (id: number, available: boolean) => patch<Doctor>(`${e.doctor(id)}/availability`, { available }), remove: (id: number) => del(e.doctor(id)),
  schedule: (id: number) => get<AvailabilityRecord[]>(e.doctorAvailability(id)),
  scheduleDay: (id: number, day: string) => get<AvailabilityRecord>(e.doctorDayAvailability(id, day)),
  replaceSchedule: (id: number, data: unknown[]) => put<AvailabilityRecord[]>(e.doctorAvailability(id), data),
  setDay: (id: number, day: string, data: unknown) => put<AvailabilityRecord>(e.doctorDayAvailability(id, day), data),
  removeDay: (id: number, day: string) => del(e.doctorDayAvailability(id, day)), clearSchedule: (id: number) => del(e.doctorAvailability(id)),
};
export const appointmentsApi = {
  list: (params?: { patientId?: number; doctorId?: number; status?: string; date?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)); });
    return get<Appointment[]>(`${e.appointments}${query.size ? `?${query}` : ""}`);
  },
  get: (id: number) => get<Appointment>(e.appointment(id)), create: (data: AppointmentCreate) => post<Appointment>(e.appointments, data),
  setStatus: (id: number, status: AppointmentStatus) => patch<Appointment>(e.appointmentStatus(id), { status }),
  reschedule: (id: number, appointmentDate: string, startTime: string, endTime: string) => patch<Appointment>(e.appointmentReschedule(id), { appointmentDate, startTime, endTime }),
  remove: (id: number) => del(e.appointment(id)),
};
