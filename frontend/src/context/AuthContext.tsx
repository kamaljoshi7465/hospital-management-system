
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import patientsData from "../data/patients.json";
import doctorsData from "../data/doctors.json";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface AuthUser {
  patientId?: number;
  doctorId?: number;
  email: string;
  fullName: string;
  role: "patient" | "doctor";
}

interface AuthContextValue {
  isLoggedIn: boolean;
  currentUser: AuthUser | null;
  login: (
    email: string,
    password: string,
    role?: "patient" | "doctor",
  ) => { success: boolean; error?: string };
  logout: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

/** Static demo password — same for every demo account */
const DEMO_PASSWORD = "medicare123";
const STORAGE_KEY = "medicare_auth_user";

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */

export const AuthContext = createContext<AuthContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // Rehydrate from localStorage on mount
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = currentUser !== null;

  /**
   * Attempt to log in with email + password.
   * Validates against patients.json or doctors.json depending on role.
   */
  const login = useCallback(
    (
      email: string,
      password: string,
      role: "patient" | "doctor" = "patient",
    ): { success: boolean; error?: string } => {
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail) {
        return { success: false, error: "Please enter your email address." };
      }
      if (!password) {
        return { success: false, error: "Please enter your password." };
      }
      if (password !== DEMO_PASSWORD) {
        return {
          success: false,
          error: "Invalid credentials. Check the demo hint below.",
        };
      }

      if (role === "doctor") {
        const matched = (
          doctorsData as { id: number; email: string; name: string }[]
        ).find((d) => d.email.toLowerCase() === trimmedEmail);

        if (!matched) {
          return {
            success: false,
            error: "No doctor account found with that email address.",
          };
        }

        const user: AuthUser = {
          doctorId: matched.id,
          email: matched.email,
          fullName: matched.name,
          role: "doctor",
        };

        setCurrentUser(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return { success: true };
      }

      // Patient login
      const matched = (
        patientsData as { id: number; email: string; fullName: string }[]
      ).find((p) => p.email.toLowerCase() === trimmedEmail);

      if (!matched) {
        return {
          success: false,
          error: "No account found with that email address.",
        };
      }

      const user: AuthUser = {
        patientId: matched.id,
        email: matched.email,
        fullName: matched.fullName,
        role: "patient",
      };

      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    },
    [],
  );

  /** Clear auth state and redirect to /login */
  const logout = useCallback(() => {
    const role = currentUser?.role;
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    if (role === "doctor") {
      navigate("/doctor-login", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, currentUser]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
