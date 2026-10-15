
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

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface AuthUser {
  patientId: number;
  email: string;
  fullName: string;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  currentUser: AuthUser | null;
  login: (
    email: string,
    password: string,
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
   * Validates against patients.json — any patient email + DEMO_PASSWORD succeeds.
   */
  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
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

      const matched = (patientsData as { id: number; email: string; fullName: string }[]).find(
        (p) => p.email.toLowerCase() === trimmedEmail,
      );

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
      };

      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    },
    [],
  );

  /** Clear auth state and redirect to /login */
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate("/login", { replace: true });
  }, [navigate]);

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
