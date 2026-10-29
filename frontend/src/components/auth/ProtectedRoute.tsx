import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "../../context/AuthContext";

interface ProtectedRouteProps { children: ReactNode; allowedRole?: AppRole | AppRole[] }
export default function ProtectedRoute({ children, allowedRole = "patient" }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading, currentUser } = useAuth();
  const location = useLocation();
  const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">Checking your session…</div>;
  if (!isLoggedIn) {
    const targetLogin = roles.length === 1 && roles[0] === "doctor" ? "/doctor-login" : "/login";
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }
  if (!currentUser || !roles.includes(currentUser.role)) {
    if (currentUser?.role === "doctor") return <Navigate to="/doctor-portal/dashboard" replace />;
    if (currentUser?.role === "admin" || currentUser?.role === "receptionist") return <Navigate to="/staff" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }
  return <>{children}</>;
}
