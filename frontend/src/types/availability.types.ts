
export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface BreakPeriod {
  startTime: string;
  endTime: string;
}

export interface DailySchedule {
  dayOfWeek: Weekday;
  startTime: string;
  endTime: string;
  breaks: BreakPeriod[];
}

export interface DoctorAvailability {
  doctorId: number;
  timezone: string;
  slotDurationMinutes: number;
  weeklySchedule: DailySchedule[];
  unavailableDates: string[];
}

export interface AppointmentSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}
