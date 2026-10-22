import { useState, useRef, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronDown,
  ExternalLink,
  LogOut,
  CalendarDays,
  UserCheck,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import DoctorSidebar from "../components/navigation/DoctorSidebar";
import ToastContainer from "../components/ui/ToastContainer";
import TelemedicineModal from "../components/ui/TelemedicineModal";
import { useHospital } from "../context/HospitalContext";
import { useAuth } from "../context/AuthContext";

export default function DoctorLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    currentDoctor,
    doctors,
    setCurrentDoctorId,
    appointments,
    patients,
    toasts,
    removeToast,
    resetDemoData,
    activeVideoCall,
    endVideoCall,
  } = useHospital();

  const { logout } = useAuth();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doctorAppointments = appointments.filter(
    (a) => a.doctorId === currentDoctor.id,
  );
  const pendingAppointments = doctorAppointments.filter((a) =>
    ["BOOKED", "CONFIRMED"].includes(a.status),
  );

  const getInitials = (name: string) =>
    name
      .replace(/^Dr\.\s*/i, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const activePatientForVideo = activeVideoCall
    ? patients.find((p) => p.id === activeVideoCall.patientId)
    : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased">
      <div className="flex">
        {/* Doctor Sidebar */}
        <DoctorSidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 flex h-16 sm:h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
                aria-label="Open sidebar menu"
              >
                <Menu size={20} />
              </button>

              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Clinical Workspace</span>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200">
                    <Sparkles size={11} /> OPD Ready
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {currentDoctor.specialization} · OPD Fee: ₹{currentDoctor.consultationFee}
                </p>
              </div>
            </div>

            {/* Right action controls */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  aria-label="View notifications"
                >
                  <Bell size={18} />
                  {pendingAppointments.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow-xs">
                      {pendingAppointments.length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2">
                      <span className="text-xs font-bold text-slate-800">
                        Upcoming OPD Patients
                      </span>
                      <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        {pendingAppointments.length} pending
                      </span>
                    </div>

                    <div className="mt-2 max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {pendingAppointments.length > 0 ? (
                        pendingAppointments.map((apt) => {
                          const patient = patients.find(
                            (p) => p.id === apt.patientId,
                          );
                          return (
                            <Link
                              key={apt.id}
                              to="/doctor-portal/appointments"
                              onClick={() => setNotificationsOpen(false)}
                              className="block p-2 text-left rounded-xl transition hover:bg-slate-50"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800 text-xs">
                                  {patient?.fullName ?? `Patient #${apt.patientId}`}
                                </span>
                                <span className="text-[10px] text-teal-600 font-medium">
                                  {apt.startTime}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                                {apt.reason}
                              </p>
                              <p className="mt-1 text-[10px] text-slate-400">
                                {apt.appointmentDate} · {apt.consultationType}
                              </p>
                            </Link>
                          );
                        })
                      ) : (
                        <p className="py-4 text-center text-xs text-slate-400">
                          No pending consultations
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden h-7 w-px bg-slate-200 sm:block" />

              {/* Doctor Account Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-xl p-1 transition hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-700 shadow-xs border border-teal-100">
                    {getInitials(currentDoctor.name)}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-xs font-semibold text-slate-800 leading-tight">
                      {currentDoctor.name}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Attending Physician
                    </span>
                  </span>
                  <ChevronDown
                    size={15}
                    className={`hidden text-slate-400 transition-transform sm:block ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                    <div className="px-2 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">
                        {currentDoctor.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentDoctor.email}
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block">
                        {currentDoctor.specialization}
                      </p>
                    </div>

                    {/* Switch Demo Doctor */}
                    <div className="py-2 border-b border-slate-100">
                      <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Switch Doctor Workspace
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {doctors.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setCurrentDoctorId(d.id);
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition ${
                              d.id === currentDoctor.id
                                ? "bg-teal-50 text-teal-800 font-semibold"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="truncate">{d.name}</span>
                            {d.id === currentDoctor.id && (
                              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 space-y-1">
                      <Link
                        to="/doctor-portal/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <UserCheck size={15} />
                        Doctor Profile & Bio
                      </Link>
                      <Link
                        to="/doctor-portal/schedule"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Clock size={15} />
                        Working Hours & Days
                      </Link>
                      <Link
                        to="/doctor-portal/appointments"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <CalendarDays size={15} />
                        Appointments
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <ExternalLink size={15} />
                        Public Website
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          resetDemoData();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                      >
                        <RefreshCw size={14} />
                        Reset Demo Data
                      </button>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut size={14} />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Child Page Content */}
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>

          {/* Toast Notification Container */}
          <ToastContainer toasts={toasts} onRemove={removeToast} />

          {/* Telemedicine Video Modal */}
          {activeVideoCall && (
            <TelemedicineModal
              appointment={activeVideoCall}
              doctor={currentDoctor}
              patientName={activePatientForVideo?.fullName ?? "Patient"}
              onClose={endVideoCall}
            />
          )}
        </div>
      </div>
    </div>
  );
}
