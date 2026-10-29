import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, doctorsApi, patientsApi, usersApi } from "../api/services";
import type { AppointmentStatus } from "../types";

export const queryKeys = { doctors: ["doctors"] as const, patients: ["patients"] as const, appointments: ["appointments"] as const, users: ["users"] as const, schedule: (id: number) => ["schedule", id] as const, medications: (id: number) => ["medications", id] as const };
export const useDoctorsQuery = () => useQuery({ queryKey: queryKeys.doctors, queryFn: () => doctorsApi.list() });
export const usePatientsQuery = (enabled = true) => useQuery({ queryKey: queryKeys.patients, queryFn: () => patientsApi.list(), enabled });
export const useAppointmentsQuery = (params?: { patientId?: number; doctorId?: number; status?: string; date?: string }, enabled = true) => useQuery({ queryKey: [...queryKeys.appointments, params ?? {}], queryFn: () => appointmentsApi.list(params), enabled });
export const useAppointmentQuery = (id: number) => useQuery({ queryKey: [...queryKeys.appointments, id], queryFn: () => appointmentsApi.get(id), enabled: id > 0 });
export const usePatientQuery = (id: number) => useQuery({ queryKey: [...queryKeys.patients, id], queryFn: () => patientsApi.get(id), enabled: id > 0 });
export const useDoctorQuery = (id: number) => useQuery({ queryKey: [...queryKeys.doctors, id], queryFn: () => doctorsApi.get(id), enabled: id > 0 });
export const useUsersQuery = (role?: string, enabled = true) => useQuery({ queryKey: [...queryKeys.users, role], queryFn: () => usersApi.list(role), enabled });
export const useScheduleQuery = (id: number) => useQuery({ queryKey: queryKeys.schedule(id), queryFn: () => doctorsApi.schedule(id), enabled: id > 0 });
export const useScheduleDayQuery = (id: number, day: string) => useQuery({ queryKey: [...queryKeys.schedule(id), day], queryFn: () => doctorsApi.scheduleDay(id, day), enabled: id > 0 && Boolean(day) });
export const useMedicationsQuery = (id: number) => useQuery({ queryKey: queryKeys.medications(id), queryFn: () => patientsApi.medications(id), enabled: id > 0 });
export function usePatientMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: queryKeys.patients });
  return {
    create: useMutation({ mutationFn: patientsApi.create, onSuccess: refresh }),
    update: useMutation({ mutationFn: ({ id, data }: { id: number; data: unknown }) => patientsApi.update(id, data), onSuccess: refresh }),
    remove: useMutation({ mutationFn: patientsApi.remove, onSuccess: refresh }),
    updateVitals: useMutation({ mutationFn: ({ id, data }: { id: number; data: unknown }) => patientsApi.updateVitals(id, data), onSuccess: refresh }),
  };
}
export function useDoctorMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: queryKeys.doctors });
  const refreshSchedule = (id: number) => qc.invalidateQueries({ queryKey: queryKeys.schedule(id) });
  return {
    create: useMutation({ mutationFn: doctorsApi.create, onSuccess: refresh }),
    update: useMutation({ mutationFn: ({ id, data }: { id: number; data: unknown }) => doctorsApi.update(id, data), onSuccess: refresh }),
    setAvailability: useMutation({ mutationFn: ({ id, available }: { id: number; available: boolean }) => doctorsApi.setAvailability(id, available), onSuccess: refresh }),
    remove: useMutation({ mutationFn: doctorsApi.remove, onSuccess: refresh }),
    replaceSchedule: useMutation({ mutationFn: ({ id, days }: { id: number; days: unknown[] }) => doctorsApi.replaceSchedule(id, days), onSuccess: (_data, variables) => refreshSchedule(variables.id) }),
    setScheduleDay: useMutation({ mutationFn: ({ id, day, data }: { id: number; day: string; data: unknown }) => doctorsApi.setDay(id, day, data), onSuccess: (_data, variables) => refreshSchedule(variables.id) }),
    removeScheduleDay: useMutation({ mutationFn: ({ id, day }: { id: number; day: string }) => doctorsApi.removeDay(id, day), onSuccess: (_data, variables) => refreshSchedule(variables.id) }),
    clearSchedule: useMutation({ mutationFn: doctorsApi.clearSchedule, onSuccess: (_data, id) => refreshSchedule(id) }),
  };
}
export function useMedicationMutations(patientId: number) {
  const qc = useQueryClient(), key = queryKeys.medications(patientId);
  return {
    create: useMutation({ mutationFn: (data: unknown) => patientsApi.addMedication(patientId, data), onSuccess: () => qc.invalidateQueries({ queryKey: key }) }),
    update: useMutation({ mutationFn: ({ id, data }: { id: number; data: unknown }) => patientsApi.updateMedication(patientId, id, data), onSuccess: () => qc.invalidateQueries({ queryKey: key }) }),
    remove: useMutation({ mutationFn: patientsApi.removeMedication.bind(null, patientId), onSuccess: () => qc.invalidateQueries({ queryKey: key }) }),
  };
}
export function useUserMutations() {
  const qc = useQueryClient(), key = queryKeys.users;
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  return {
    create: useMutation({ mutationFn: usersApi.create, onSuccess: refresh }),
    update: useMutation({ mutationFn: ({ id, data }: { id: number; data: unknown }) => usersApi.update(id, data), onSuccess: refresh }),
    remove: useMutation({ mutationFn: usersApi.remove, onSuccess: refresh }),
  };
}
export function useHospitalMutations() {
  const qc = useQueryClient();
  const refresh = async (...keys: (readonly unknown[])[]) => Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey })));
  const createAppointment = useMutation({ mutationFn: appointmentsApi.create, onSuccess: () => refresh(queryKeys.appointments) });
  const updateAppointment = useMutation({ mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) => appointmentsApi.setStatus(id, status), onSuccess: () => refresh(queryKeys.appointments) });
  const cancelAppointment = useMutation({ mutationFn: appointmentsApi.remove, onSuccess: () => refresh(queryKeys.appointments) });
  const rescheduleAppointment = useMutation({ mutationFn: ({ id, date, start, end }: { id: number; date: string; start: string; end: string }) => appointmentsApi.reschedule(id, date, start, end), onSuccess: () => refresh(queryKeys.appointments) });
  const updatePatient = useMutation({ mutationFn: ({ id, data }: { id: number; data: unknown }) => patientsApi.update(id, data), onSuccess: () => refresh(queryKeys.patients) });
  const updateVitals = useMutation({ mutationFn: ({ id, data }: { id: number; data: unknown }) => patientsApi.updateVitals(id, data), onSuccess: () => refresh(queryKeys.patients) });
  const updateDoctor = useMutation({ mutationFn: ({ id, data }: { id: number; data: unknown }) => doctorsApi.update(id, data), onSuccess: () => refresh(queryKeys.doctors) });
  const saveSchedule = useMutation({ mutationFn: ({ id, days }: { id: number; days: unknown[] }) => doctorsApi.replaceSchedule(id, days), onSuccess: (_d, variables) => refresh(queryKeys.schedule(variables.id), queryKeys.doctors) });
  return { createAppointment, updateAppointment, cancelAppointment, rescheduleAppointment, updatePatient, updateVitals, updateDoctor, saveSchedule };
}

export function useAppointmentMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: queryKeys.appointments });
  return {
    create: useMutation({ mutationFn: appointmentsApi.create, onSuccess: refresh }),
    updateStatus: useMutation({ mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) => appointmentsApi.setStatus(id, status), onSuccess: refresh }),
    reschedule: useMutation({ mutationFn: ({ id, date, start, end }: { id: number; date: string; start: string; end: string }) => appointmentsApi.reschedule(id, date, start, end), onSuccess: refresh }),
    remove: useMutation({ mutationFn: appointmentsApi.remove, onSuccess: refresh }),
  };
}
