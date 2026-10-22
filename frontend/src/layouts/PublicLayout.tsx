
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  HeartPulse,
  PhoneCall,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  Mail,
  UserRound,
  UserCheck,
  LogOut,
} from "lucide-react";
import { useHospital } from "../context/HospitalContext";
import { useAuth } from "../context/AuthContext";

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentPatient } = useHospital();
  const { isLoggedIn, logout } = useAuth();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Find Doctors", path: "/doctor" },
    { label: "Book Appointment", path: "/patient/book" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* Top Notification Bar */}
      <div className="border-b border-slate-100 bg-[#10243e] py-2 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-teal-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              24/7 Emergency Care Ready
            </span>
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className="hidden sm:inline text-slate-300">
              Helpline: 1800-MEDICARE / Ambulance: 108
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="hidden md:flex items-center gap-1">
              <Clock size={12} className="text-teal-400" />
              OPD Hours: 8:00 AM – 8:00 PM
            </span>
            {isLoggedIn && (
              <>
                <span className="hidden md:inline text-slate-500">|</span>
                <div className="flex items-center gap-2">
                  <Link
                    to="/patient/dashboard"
                    className="font-medium text-teal-300 hover:text-teal-200 transition"
                  >
                    Logged in as {currentPatient.fullName.split(" ")[0]}
                  </Link>
                  <span className="text-slate-500">·</span>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-slate-400 hover:text-rose-300 transition"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16b8a6] text-white shadow-md shadow-teal-900/20">
              <HeartPulse size={23} strokeWidth={2.3} />
            </span>
            <div>
              <span className="block text-lg font-bold tracking-tight text-[#10243e]">
                MediCare
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Hospital & Clinics
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-semibold tracking-wide transition ${
                    active
                      ? "text-teal-700 font-bold"
                      : "text-slate-600 hover:text-[#1265b5]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href="tel:108"
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              <PhoneCall size={14} className="text-rose-600" />
              <span>108 Emergency</span>
            </a>

            <Link
              to="/doctor-login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <UserCheck size={14} className="text-teal-600" />
              <span>Doctor Portal</span>
            </Link>

            {!isLoggedIn ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1265b5] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-900/15 transition hover:bg-[#0e559b]"
              >
                <UserRound size={14} />
                <span>Patient Portal</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                <Link
                  to="/patient/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1265b5] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-900/15 transition hover:bg-[#0e559b]"
                >
                  <UserRound size={14} />
                  <span>Patient Portal</span>
                  <ArrowRight size={13} />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/doctor-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-xs"
                >
                  <UserCheck size={15} className="text-teal-600" />
                  <span>Doctor Portal Login</span>
                </Link>

                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1265b5] py-2.5 text-xs font-semibold text-white shadow-xs"
                  >
                    <UserRound size={15} />
                    <span>Patient Portal Login</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/patient/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#1265b5] py-2.5 text-xs font-semibold text-white"
                    >
                      <UserRound size={15} />
                      <span>Open Patient Portal</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
                <a
                  href="tel:108"
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700"
                >
                  <PhoneCall size={15} />
                  Emergency Ambulance: 108
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-[#10243e] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Col 1: Brand */}
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16b8a6] text-white">
                  <HeartPulse size={23} />
                </span>
                <span className="text-xl font-bold tracking-tight">MediCare</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">
                Pioneering modern patient-first healthcare. Providing high-standard clinical
                excellence, outpatient consultations, and integrated digital telehealth.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#4be0cc]">
                <ShieldCheck size={16} />
                <span>NABH Accredited & ISO 9001:2026 Certified</span>
              </div>
            </div>

            {/* Col 2: Hospital Departments */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                Specialties
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link to="/doctor" className="hover:text-white transition">
                    Cardiology & Heart Center
                  </Link>
                </li>
                <li>
                  <Link to="/doctor" className="hover:text-white transition">
                    Neurology & Stroke Unit
                  </Link>
                </li>
                <li>
                  <Link to="/doctor" className="hover:text-white transition">
                    Pediatrics & Child Wellness
                  </Link>
                </li>
                <li>
                  <Link to="/doctor" className="hover:text-white transition">
                    Orthopedics & Joint Surgery
                  </Link>
                </li>
                <li>
                  <Link to="/doctor" className="hover:text-white transition">
                    Dermatology & Skin Clinic
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Patient Services */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                Patient Services
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link to="/patient/dashboard" className="hover:text-white transition">
                    Patient Portal Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/patient/appointments" className="hover:text-white transition">
                    Consultation Records
                  </Link>
                </li>
                <li>
                  <Link to="/patient/book" className="hover:text-white transition">
                    Book OPD Slot Online
                  </Link>
                </li>
                <li>
                  <Link to="/patient/profile" className="hover:text-white transition">
                    Health Vitals & Medical History
                  </Link>
                </li>
                <li>
                  <Link to="/doctor-login" className="hover:text-teal-300 text-teal-400 font-semibold transition">
                    Doctor Clinical Portal →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact & Hours */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                Hospital Campus
              </p>
              <div className="space-y-3 text-xs text-slate-400">
                <p className="flex items-start gap-2">
                  <MapPin size={15} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>Sector 62, Institutional Area, Noida, Uttar Pradesh 201309</span>
                </p>
                <p className="flex items-center gap-2">
                  <PhoneCall size={14} className="text-teal-400 shrink-0" />
                  <span>+91 (0120) 240-5500</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-teal-400 shrink-0" />
                  <span>care@medicare-hospital.example</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 MediCare Hospital System. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer">Patient Bill of Rights</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
