/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { type AuthenticatedUser, type SignupInput, type UserRole } from "../api/auth";
import { getAccessToken, setAccessToken } from "../api/client";
import { authQueryKeys, useAuthProfileQuery, useLoginMutation, useLogoutMutation, useSignupMutation } from "../hooks/useAuthApi";

export type AppRole = Lowercase<UserRole>;
export type AuthUser = Omit<AuthenticatedUser, "role"> & { fullName: string; role: AppRole };
interface AuthContextValue {
  isLoggedIn: boolean; isLoading: boolean; currentUser: AuthUser | null;
  login: (email: string, password: string, expectedRole?: AppRole) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: AuthenticatedUser): AuthUser {
  return { ...user, fullName: user.name, role: user.role.toLowerCase() as AppRole };
}
function errorMessage(error: unknown) { return error instanceof Error ? error.message : "The request failed. Please try again."; }
function roleHome(role: AppRole) {
  if (role === "doctor") return "/doctor-portal/dashboard";
  if (role === "admin" || role === "receptionist") return "/staff";
  return "/patient/dashboard";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profileQuery = useAuthProfileQuery(Boolean(getAccessToken()));
  const currentUser = profileQuery.data ? toAuthUser(profileQuery.data) : null;
  const isLoading = Boolean(getAccessToken()) && profileQuery.isLoading;
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const logoutMutation = useLogoutMutation();

  const endSession = useCallback(() => {
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: authQueryKeys.profile });
  }, [queryClient]);

  useEffect(() => {
    const handleUnauthorized = () => { endSession(); navigate("/login", { replace: true, state: { sessionExpired: true } }); };
    window.addEventListener("hospital:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("hospital:unauthorized", handleUnauthorized);
  }, [endSession, navigate]);

  const accept = (user: AuthenticatedUser, token: string) => {
    setAccessToken(token); queryClient.setQueryData(authQueryKeys.profile, user); const normalized = toAuthUser(user); navigate(roleHome(normalized.role), { replace: true });
  };
  const login = async (email: string, password: string, expectedRole?: AppRole) => {
    try {
      const result = await loginMutation.mutateAsync({ email: email.trim(), password });
      const user = toAuthUser(result.user);
      if (expectedRole && expectedRole !== user.role) return { success: false, error: `This account does not have the ${expectedRole} role.` };
      accept(result.user, result.accessToken); return { success: true };
    } catch (error) { return { success: false, error: errorMessage(error) }; }
  };
  const signup = async (data: SignupInput) => {
    try { const result = await signupMutation.mutateAsync(data); accept(result.user, result.accessToken); return { success: true }; }
    catch (error) { return { success: false, error: errorMessage(error) }; }
  };
  const logout = async () => {
    const role = currentUser?.role;
    try { if (getAccessToken()) await logoutMutation.mutateAsync(); } catch { /* always clear the local session */ }
    endSession(); navigate(role === "doctor" ? "/doctor-login" : "/login", { replace: true });
  };

  return <AuthContext.Provider value={{ isLoggedIn: currentUser !== null, isLoading, currentUser, login, signup, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside <AuthProvider>"); return context; }
