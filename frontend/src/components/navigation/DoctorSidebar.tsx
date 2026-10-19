import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  Check,
  LogOut,
  X,
} from "lucide-react";
import { useHospital } from "../../context/HospitalContext";
import { useAuth } from "../../context/AuthContext";

interface DoctorSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function DoctorSidebar({ mobileOpen, onClose }: DoctorSidebarProps) {
  const { currentDoctor, appointments } = useHospital();
  const { logout } = useAuth();

  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = appointments.filter(
    (a) =>
      a.doctorId === currentDoctor.id &&
      a.appointmentDate === todayStr &&
      ["BOOKED", "CONFIRMED"].includes(a.status),
  ).length;

  const navigation = [
    {
      label: "Overview",
      path: "/doctor-portal/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Appointments",
      path: "/doctor-portal/appointments",
      icon: CalendarDays,
      badge: todayCount > 0 ? todayCount : undefined,
    },
    {
      label: "My Schedule",
      path: "/doctor-portal/schedule",
      icon: Clock,
    },
    {
      label: "Doctor Profile",
      path: "/doctor-portal/profile",
      icon: UserCheck,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .replace(/^Dr\.\s*/i, "")
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
            to="/doctor-portal/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16b8a6] text-white shadow-lg shadow-teal-950/20">
              <Stethoscope size={22} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-[17px] font-bold tracking-tight">
                MediCare
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.19em] text-teal-400">
                Doctor Portal
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
            Clinical Workspace
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
                        {badge} Today
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
            <p className="text-xs font-semibold text-white">Clinical Portal Active</p>
            <p className="mt-1 text-[11px] leading-4 text-slate-400">
              OPD schedule & consultation controls.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium text-[#62dfcf]">
              <Check size={12} />
              Verified Physician Session
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-2 pt-3">
            <Link
              to="/doctor-portal/profile"
              onClick={onClose}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16b8a6]/20 text-sm font-bold text-[#48ddca] ring-1 ring-white/10">
                {getInitials(currentDoctor.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {currentDoctor.name}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                  {currentDoctor.specialization}
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
