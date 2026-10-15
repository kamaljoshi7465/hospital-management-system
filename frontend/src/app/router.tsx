
import { createBrowserRouter, Navigate } from "react-router-dom";

import RootLayout from "../layouts/RootLayout";
import PublicLayout from "../layouts/PublicLayout";
import PatientLayout from "../layouts/PatientLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import HomePage from "../features/dashboard/pages/HomePage";
import DoctorProfilePage from "../features/doctors/pages/DoctorProfilePage";
import PatientDashboardPage from "../features/dashboard/pages/PatientDashboardPage";
import AppointmentsPage from "../features/appointments/pages/AppointmentsPage";
import BookingPage from "../features/appointments/pages/BookingPage";
import PatientProfilePage from "../features/dashboard/pages/PatientProfilePage";

export const router = createBrowserRouter([
  {
    /** RootLayout provides AuthProvider + HospitalProvider to all children */
    element: <RootLayout />,
    children: [
      /* ── Public routes ── */
      {
        element: <PublicLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/doctor", element: <DoctorProfilePage /> },
        ],
      },

      /* ── Auth routes ── */
      { path: "/login", element: <LoginPage /> },

      /* ── Protected patient routes ── */
      {
        path: "/patient",
        element: (
          <ProtectedRoute>
            <PatientLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/patient/dashboard" replace />,
          },
          { path: "dashboard", element: <PatientDashboardPage /> },
          { path: "appointments", element: <AppointmentsPage /> },
          { path: "book", element: <BookingPage /> },
          { path: "book/:doctorId", element: <BookingPage /> },
          { path: "profile", element: <PatientProfilePage /> },
        ],
      },

      /* ── Fallback ── */
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
