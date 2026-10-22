import appointmentsJson from "./appointments.json";
import type { Appointment } from "../types";

export const appointments: Appointment[] =
  appointmentsJson as Appointment[];