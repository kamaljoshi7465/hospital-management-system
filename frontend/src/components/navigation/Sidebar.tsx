
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarPlus,
  Stethoscope,
  UserRound,
  HeartPulse,
  ShieldCheck,
  Check,
  LogOut,
  X,
} from "lucide-react";
import { useHospital } from "../../context/HospitalContext";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { currentPatient, appointments } = useHospital();
  const { logout } = useAuth();

  const upcomingCount = appointments.filter(
    (a) =>
      a.patientId === currentPatient.id &&
      ["BOOKED", "CONFIRMED"].includes(a.status),
  ).length;

  const navigation = [
    { label: "Overview", path: "/patient/dashboard", icon: LayoutDashboard },
    {
      label: "Appointments",
      path: "/patient/appointments",
      icon: CalendarDays,
      badge: upcomingCount > 0 ? upcomingCount : undefined,
    },
    { label: "Book Appointment", path: "/patient/book", icon: CalendarPlus },
    { label: "Find a Doctor", path: "/doctor", icon: Stethoscope },
    { label: "My Profile", path: "/patient/profile", icon: UserRound },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[265px] flex-col bg-[#10243e] text-white transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <Link
            to="/patient/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16b8a6] text-white shadow-lg shadow-teal-950/20">
              <HeartPulse size={23} strokeWidth={2.3} />
            </span>
            <span>
              <span className="block text-[17px] font-bold tracking-tight">
                MediCare
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.19em] text-slate-400">
                Patient portal
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navigation.map(({ label, path, icon: Icon, badge }) => (
              <NavLink
                key={label}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `relative group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition ${
                    isActive
                      ? "bg-[#1d3b59] text-white shadow-sm ring-1 ring-white/5"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-full bg-[#31d5c1]" />
                    )}
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-[#48ddca]"
                          : "text-slate-400 group-hover:text-white"
                      }
                    />
                    <span>{label}</span>
                    {badge !== undefined && (
                      <span className="ml-auto rounded-md bg-[#16b8a6]/20 px-2 py-0.5 text-[10px] font-semibold text-[#62dfcf]">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Security badge and profile section */}
        <div className="mt-auto px-4 pb-5">
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.045] p-3.5">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-teal-400/10 text-[#4be0cc]">
              <ShieldCheck size={18} />
            </div>
            <p className="text-xs font-semibold text-white">Your health, secured</p>
            <p className="mt-1 text-[11px] leading-4 text-slate-400">
              Encrypted records & HIPAA compliant portal.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium text-[#62dfcf]">
              <Check size={12} />
              Verified Patient Session
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-2 pt-3">
            <Link
              to="/patient/profile"
              onClick={onClose}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9e9f6] text-sm font-bold text-[#173c5b]">
                {getInitials(currentPatient.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {currentPatient.fullName}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Blood Group {currentPatient.bloodGroup}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              title="Log out"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-rose-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
