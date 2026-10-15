
import { Outlet } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { HospitalProvider } from "../context/HospitalContext";

/**
 * RootLayout wraps all routes with the global context providers.
 * AuthProvider is here (inside RouterProvider) so it can call useNavigate.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <HospitalProvider>
        <Outlet />
      </HospitalProvider>
    </AuthProvider>
  );
}
