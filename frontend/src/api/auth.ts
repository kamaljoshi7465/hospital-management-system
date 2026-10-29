import { get, post } from "./client";
import { endpoints } from "./endpoints";

export type UserRole = "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";
export interface AuthenticatedUser { id: number; name: string; email: string; role: UserRole; patientId?: number; doctorId?: number }
export interface AuthResponse { accessToken: string; tokenType: "Bearer"; expiresIn: number; user: AuthenticatedUser }
export interface SignupInput { name: string; email: string; password: string; phone: string; dateOfBirth: string; gender: "MALE" | "FEMALE" | "OTHER" }
export const authApi = {
  signup: (data: SignupInput) => post<AuthResponse>(endpoints.auth.signup, data),
  login: (email: string, password: string) => post<AuthResponse>(endpoints.auth.login, { email, password }),
  logout: () => post<void>(endpoints.auth.logout, {}),
  me: () => get<AuthenticatedUser>(endpoints.auth.me),
};
