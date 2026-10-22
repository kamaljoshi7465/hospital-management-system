import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: "patient" | "doctor";
}

export default function ProtectedRoute({
  children,
  allowedRole = "patient",
}: ProtectedRouteProps) {
  const { isLoggedIn, currentUser } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    const targetLogin =
      allowedRole === "doctor" ? "/doctor-login" : "/login";
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // If wrong role is authenticated, redirect to appropriate portal
  if (allowedRole === "doctor" && currentUser?.role !== "doctor") {
    return <Navigate to="/doctor-login" replace />;
  }

  if (allowedRole === "patient" && currentUser?.role !== "patient") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
