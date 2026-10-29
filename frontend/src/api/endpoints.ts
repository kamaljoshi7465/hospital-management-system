const API = "/api";
export const endpoints = {
  auth: { signup: `${API}/auth/signup`, login: `${API}/auth/login`, logout: `${API}/auth/logout`, me: `${API}/auth/me` },
  users: `${API}/users`, user: (id: number) => `${API}/users/${id}`,
  patients: `${API}/patients`, patient: (id: number) => `${API}/patients/${id}`,
  patientByUser: (id: number) => `${API}/patients/user/${id}`,
  patientVitals: (id: number) => `${API}/patients/${id}/vitals`,
  medications: (id: number) => `${API}/patients/${id}/medications`,
  medication: (patientId: number, medicationId: number) => `${API}/patients/${patientId}/medications/${medicationId}`,
  doctors: `${API}/doctors`, doctor: (id: number) => `${API}/doctors/${id}`,
  doctorByUser: (id: number) => `${API}/doctors/user/${id}`,
  doctorAvailability: (id: number) => `${API}/doctors/${id}/availability`,
  doctorDayAvailability: (id: number, day: string) => `${API}/doctors/${id}/availability/${day}`,
  appointments: `${API}/appointments`, appointment: (id: number) => `${API}/appointments/${id}`,
  appointmentStatus: (id: number) => `${API}/appointments/${id}/status`,
  appointmentReschedule: (id: number) => `${API}/appointments/${id}/reschedule`,
} as const;
