import { createBrowserRouter, Navigate } from "react-router-dom";

import RootLayout from "../layouts/RootLayout";
import PublicLayout from "../layouts/PublicLayout";
import PatientLayout from "../layouts/PatientLayout";
import DoctorLayout from "../layouts/DoctorLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import DoctorLoginPage from "../features/auth/pages/DoctorLoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import StaffDashboardPage from "../features/dashboard/pages/StaffDashboardPage";
import HomePage from "../features/dashboard/pages/HomePage";
import DoctorProfilePage from "../features/doctors/pages/DoctorProfilePage";
import PatientDashboardPage from "../features/dashboard/pages/PatientDashboardPage";
import AppointmentsPage from "../features/appointments/pages/AppointmentsPage";
import BookingPage from "../features/appointments/pages/BookingPage";
import PatientProfilePage from "../features/dashboard/pages/PatientProfilePage";

import DoctorDashboardPage from "../features/doctors/pages/doctor-portal/DoctorDashboardPage";
import DoctorAppointmentsPage from "../features/doctors/pages/doctor-portal/DoctorAppointmentsPage";
import DoctorPortalProfilePage from "../features/doctors/pages/doctor-portal/DoctorPortalProfilePage";
import DoctorSchedulePage from "../features/doctors/pages/doctor-portal/DoctorSchedulePage";

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
      { path: "/doctor-login", element: <DoctorLoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/staff", element: <ProtectedRoute allowedRole={["admin", "receptionist"]}><StaffDashboardPage /></ProtectedRoute> },

      /* ── Protected patient routes ── */
      {
        path: "/patient",
        element: (
          <ProtectedRoute allowedRole="patient">
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

      /* ── Protected doctor portal routes ── */
      {
        path: "/doctor-portal",
        element: (
          <ProtectedRoute allowedRole="doctor">
            <DoctorLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/doctor-portal/dashboard" replace />,
          },
          { path: "dashboard", element: <DoctorDashboardPage /> },
          { path: "appointments", element: <DoctorAppointmentsPage /> },
          { path: "schedule", element: <DoctorSchedulePage /> },
          { path: "profile", element: <DoctorPortalProfilePage /> },
        ],
      },

      /* ── Fallback ── */
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
