
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface PatientAddress {
  city: string;
  state: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface PatientVitals {
  bloodPressure: string;
  heartRate: number;
  bloodSugar: number;
  weightKg: number;
  heightCm: number;
  temperatureF: number;
  lastUpdated: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  doctor: string;
  refillStatus: "Active" | "Refill Due" | "Completed";
}

export interface Patient {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: string;
  address: PatientAddress;
  createdAt: string;
  emergencyContact?: EmergencyContact;
  allergies?: string[];
  chronicConditions?: string[];
  vitals?: PatientVitals;
  medications?: Medication[];
}
