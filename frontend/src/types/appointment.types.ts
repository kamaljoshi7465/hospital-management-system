
export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type ConsultationType =
  | "IN_PERSON"
  | "ONLINE";

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason: string;
  consultationType: ConsultationType;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  doctorId: number;
  appointmentDate: string;
  startTime: string;
  reason: string;
  consultationType: ConsultationType;
}
