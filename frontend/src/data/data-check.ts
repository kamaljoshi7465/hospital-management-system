
import doctorsJson from "./doctors.json";
import patientsJson from "./patients.json";
import appointmentsJson from "./appointments.json";
import availabilityJson from "./availability.json";

import type {
  Doctor,
  Patient,
  Appointment,
  DoctorAvailability,
} from "../types";

export const doctors = patientsafe<Doctor[]>(doctorsJson);
export const patients = patientsafe<Patient[]>(patientsJson);
export const appointments = patientsafe<Appointment[]>(appointmentsJson);
export const availability =
  patientsafe<DoctorAvailability>(availabilityJson);

function patientsafe<T>(data: unknown): T {
  return data as T;
}