
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import doctorsJson from "../data/doctors.json";
import appointmentsJson from "../data/appointments.json";
import patientsJson from "../data/patients.json";
import { AuthContext } from "./AuthContext";

import type {
  Doctor,
  Appointment,
  Patient,
  ConsultationType,
  AppointmentStatus,
  PatientVitals,
} from "../types";

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

interface BookAppointmentInput {
  doctorId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  consultationType: ConsultationType;
}

interface HospitalContextType {
  doctors: Doctor[];
  appointments: Appointment[];
  patients: Patient[];
  currentPatient: Patient;
  setCurrentPatientId: (id: number) => void;
  bookAppointment: (input: BookAppointmentInput) => Appointment;
  cancelAppointment: (id: number) => void;
  rescheduleAppointment: (
    id: number,
    appointmentDate: string,
    startTime: string,
    endTime: string,
  ) => void;
  updatePatient: (updated: Partial<Patient>) => void;
  updateVitals: (vitals: Partial<PatientVitals>) => void;
  resetDemoData: () => void;
  toasts: Toast[];
  addToast: (
    title: string,
    message: string,
    type?: "success" | "info" | "warning" | "error",
  ) => void;
  removeToast: (id: string) => void;
  activeVideoCall: Appointment | null;
  startVideoCall: (appointment: Appointment) => void;
  endVideoCall: () => void;
}

const STORAGE_KEYS = {
  APPOINTMENTS: "medicare_appointments_v1",
  PATIENTS: "medicare_patients_v1",
  CURRENT_PATIENT_ID: "medicare_patient_id_v1",
};

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: ReactNode }) {
  const [doctors] = useState<Doctor[]>(doctorsJson as Doctor[]);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return stored ? JSON.parse(stored) : (appointmentsJson as Appointment[]);
    } catch {
      return appointmentsJson as Appointment[];
    }
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return stored ? JSON.parse(stored) : (patientsJson as Patient[]);
    } catch {
      return patientsJson as Patient[];
    }
  });

  const auth = useContext(AuthContext);

  const [switchedPatientId, setSwitchedPatientId] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT_ID);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const currentPatientId = switchedPatientId ?? auth?.currentUser?.patientId ?? 1;

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeVideoCall, setActiveVideoCall] = useState<Appointment | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch {
      // ignore
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    } catch {
      // ignore
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_PATIENT_ID,
        JSON.stringify(currentPatientId),
      );
    } catch {
      // ignore
    }
  }, [currentPatientId]);

  const currentPatient =
    patients.find((p) => p.id === currentPatientId) || patients[0];

  const addToast = (
    title: string,
    message: string,
    type: "success" | "info" | "warning" | "error" = "success",
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: Toast = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrentPatientId = (id: number) => {
    setSwitchedPatientId(id);
    const pat = patients.find((p) => p.id === id);
    if (pat) {
      addToast(
        "Account Switched",
        `Viewing profile as ${pat.fullName}`,
        "info",
      );
    }
  };

  const bookAppointment = (input: BookAppointmentInput): Appointment => {
    const doctor = doctors.find((d) => d.id === input.doctorId);
    const newAppointment: Appointment = {
      id: Math.max(100, ...appointments.map((a) => a.id)) + 1,
      patientId: currentPatient.id,
      doctorId: input.doctorId,
      appointmentDate: input.appointmentDate,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "CONFIRMED",
      reason: input.reason || "General Consultation",
      consultationType: input.consultationType,
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    addToast(
      "Appointment Confirmed!",
      `Consultation with ${doctor?.name ?? "Doctor"} on ${input.appointmentDate} at ${input.startTime}.`,
      "success",
    );

    return newAppointment;
  };

  const cancelAppointment = (id: number) => {
    const target = appointments.find((a) => a.id === id);
    const doc = doctors.find((d) => d.id === target?.doctorId);

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" as AppointmentStatus } : a)),
    );

    addToast(
      "Appointment Cancelled",
      `Your appointment with ${doc?.name ?? "Doctor"} has been cancelled.`,
      "warning",
    );
  };

  const rescheduleAppointment = (
    id: number,
    appointmentDate: string,
    startTime: string,
    endTime: string,
  ) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              appointmentDate,
              startTime,
              endTime,
              status: "CONFIRMED" as AppointmentStatus,
            }
          : a,
      ),
    );

    addToast(
      "Appointment Rescheduled",
      `Moved to ${appointmentDate} at ${startTime}.`,
      "success",
    );
  };

  const updatePatient = (updated: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === currentPatient.id ? { ...p, ...updated } : p)),
    );

    addToast(
      "Profile Updated",
      "Your personal health records have been saved.",
      "success",
    );
  };

  const updateVitals = (vitalsUpdate: Partial<PatientVitals>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === currentPatient.id) {
          const existingVitals = p.vitals || {
            bloodPressure: "120/80",
            heartRate: 72,
            bloodSugar: 90,
            weightKg: 70,
            heightCm: 175,
            temperatureF: 98.6,
            lastUpdated: new Date().toISOString().split("T")[0],
          };
          return {
            ...p,
            vitals: {
              ...existingVitals,
              ...vitalsUpdate,
              lastUpdated: new Date().toISOString().split("T")[0],
            },
          };
        }
        return p;
      }),
    );

    addToast(
      "Vitals Logged",
      "Your latest health vitals have been recorded.",
      "success",
    );
  };

  const resetDemoData = () => {
    setAppointments(appointmentsJson as Appointment[]);
    setPatients(patientsJson as Patient[]);
    setSwitchedPatientId(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
      localStorage.removeItem(STORAGE_KEYS.PATIENTS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PATIENT_ID);
    } catch {
      // ignore
    }
    addToast(
      "Data Reset",
      "Demo data has been restored to default state.",
      "info",
    );
  };

  const startVideoCall = (appointment: Appointment) => {
    setActiveVideoCall(appointment);
  };

  const endVideoCall = () => {
    setActiveVideoCall(null);
  };

  return (
    <HospitalContext.Provider
      value={{
        doctors,
        appointments,
        patients,
        currentPatient,
        setCurrentPatientId,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        updatePatient,
        updateVitals,
        resetDemoData,
        toasts,
        addToast,
        removeToast,
        activeVideoCall,
        startVideoCall,
        endVideoCall,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useHospital(): HospitalContextType {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error("useHospital must be used within a HospitalProvider");
  }
  return context;
}
