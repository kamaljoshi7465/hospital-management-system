
import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  PhoneCall,
  UserRound,
  CalendarDays,
  RefreshCw,
  ExternalLink,
  LogOut,
} from "lucide-react";
import Sidebar from "../components/navigation/Sidebar";
import ToastContainer from "../components/ui/ToastContainer";
import TelemedicineModal from "../components/ui/TelemedicineModal";
import { useHospital } from "../context/HospitalContext";
import { useAuth } from "../context/AuthContext";

export default function PatientLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentPatient,
    patients,
    setCurrentPatientId,
    appointments,
    doctors,
    toasts,
    removeToast,
    resetDemoData,
    activeVideoCall,
    endVideoCall,
  } = useHospital();
  const { logout } = useAuth();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine breadcrumb based on current path
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes("/appointments")) return "Appointments";
    if (path.includes("/book")) return "Book Appointment";
    if (path.includes("/profile")) return "My Profile";
    return "Overview";
  };

  const upcomingPatientAppointments = appointments
    .filter(
      (a) =>
        a.patientId === currentPatient.id &&
        ["BOOKED", "CONFIRMED"].includes(a.status),
    )
    .slice(0, 3);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/patient/appointments?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const activeDoctorForVideo = activeVideoCall
    ? doctors.find((d) => d.id === activeVideoCall.doctorId)
    : undefined;

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-800">
      <div className="flex min-h-screen">
        {/* Responsive Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
              {/* Left: Mobile Toggle & Breadcrumbs */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="Open navigation"
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
                >
                  <Menu size={20} />
                </button>

                <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                  <Link to="/patient/dashboard" className="hover:text-slate-600">
                    Patient portal
                  </Link>
                  <span>/</span>
                  <span className="font-semibold text-slate-800">
                    {getBreadcrumb()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-800 sm:hidden">
                  {getBreadcrumb()}
                </span>
              </div>

              {/* Right: Quick Search, Emergency Pill, Notifications & Profile */}
              <div className="flex items-center gap-2.5 sm:gap-4">
                {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative hidden md:block"
              >
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  placeholder="Search appointments & doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </form>

              {/* Emergency Hotline Button */}
              <a
                href="tel:108"
                className="hidden xl:flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/15 transition hover:bg-rose-100"
                title="Emergency Ambulance Hotline"
              >
                <PhoneCall size={14} className="text-rose-600 animate-pulse" />
                <span>Emergency: 108</span>
              </a>

              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 ${
                    notificationsOpen ? "bg-slate-100 border-slate-300" : ""
                  }`}
                >
                  <Bell size={18} />
                  {upcomingPatientAppointments.length > 0 && (
                    <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">
                        Notifications ({upcomingPatientAppointments.length})
                      </p>
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                        Upcoming visits
                      </span>
                    </div>

                    <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto">
                      {upcomingPatientAppointments.length > 0 ? (
                        upcomingPatientAppointments.map((apt) => {
                          const doc = doctors.find((d) => d.id === apt.doctorId);
                          return (
                            <Link
                              key={apt.id}
                              to="/patient/appointments"
                              onClick={() => setNotificationsOpen(false)}
                              className="block rounded-xl bg-slate-50 p-2.5 text-xs transition hover:bg-blue-50"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">
                                  {doc?.name ?? "Doctor"}
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
                          No pending notifications
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden h-7 w-px bg-slate-200 sm:block" />

              {/* User Account Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-xl p-1 transition hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d9e9f6] text-xs font-bold text-[#173c5b] shadow-xs">
                    {getInitials(currentPatient.fullName)}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-xs font-semibold text-slate-800 leading-tight">
                      {currentPatient.fullName}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Patient Account
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
                        {currentPatient.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentPatient.email}
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block">
                        Blood Group: {currentPatient.bloodGroup}
                      </p>
                    </div>

                    {/* Switch Demo Patient */}
                    <div className="py-2 border-b border-slate-100">
                      <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Switch Demo Account
                      </p>
                      {patients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setCurrentPatientId(p.id);
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition ${
                            p.id === currentPatient.id
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>{p.fullName}</span>
                          {p.id === currentPatient.id && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 space-y-1">
                      <Link
                        to="/patient/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <UserRound size={15} />
                        My Profile & Medical Records
                      </Link>
                      <Link
                        to="/patient/appointments"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <CalendarDays size={15} />
                        My Appointments
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <ExternalLink size={15} />
                        Hospital Home Page
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
          </div>
        </header>

          {/* Child Page Content */}
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>

          {/* Toast Notification Container */}
          <ToastContainer toasts={toasts} onRemove={removeToast} />

          {/* Telemedicine Active Video Modal */}
          {activeVideoCall && (
            <TelemedicineModal
              appointment={activeVideoCall}
              doctor={activeDoctorForVideo}
              patientName={currentPatient.fullName}
              onClose={endVideoCall}
            />
          )}
        </div>
      </div>
    </div>
  );
}
