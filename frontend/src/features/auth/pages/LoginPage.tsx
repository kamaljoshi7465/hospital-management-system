import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const { login, isLoggedIn, isLoading: sessionLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect to dashboard
  useEffect(() => {
    if (sessionLoading) return;
    if (isLoggedIn && currentUser) {
      const path = currentUser.role === "doctor" ? "/doctor-portal/dashboard" : currentUser.role === "admin" || currentUser.role === "receptionist" ? "/staff" : "/patient/dashboard";
      navigate(path, { replace: true });
    }
  }, [isLoggedIn, currentUser, navigate, sessionLoading]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Invalid email or password.");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] lg:flex-row">
      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL: Minimal, Trust-Focused Healthcare Hero
      ───────────────────────────────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#10243e] p-10 text-white lg:flex lg:w-[48%] xl:w-[45%] lg:p-12 xl:p-16">
        {/* Subtle ambient gradient */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#16b8a6] text-white shadow-lg shadow-teal-950/30 transition group-hover:scale-105">
              <HeartPulse size={24} strokeWidth={2.4} />
            </span>
            <div>
              <span className="block text-xl font-bold tracking-tight text-white">
                MediCare
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400">
                Patient Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 my-auto py-8">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl xl:text-[42px]">
            Your health records,{" "}
            <span className="text-[#3edec9]">connected &amp; secure.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            Schedule specialist consultations, access verified medical notes, track
            live vitals, and connect with your care team effortlessly.
          </p>

          {/* Minimal Live Preview Card */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-2 ring-teal-400/30">
                  <img
                    src="https://images.unsplash.com/photo-1594824813682-127dbca03780?auto=format&fit=crop&q=80&w=200"
                    alt="Dr. Sneha Kulkarni"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#10243e]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white">
                      Dr. Sneha Kulkarni
                    </p>
                    <CheckCircle2 size={12} className="text-[#3edec9]" />
                  </div>
                  <p className="text-[11px] text-teal-300">
                    Cardiologist · Today at 4:30 PM
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-teal-500/20 px-2.5 py-1 text-[10px] font-semibold text-[#5eead4]">
                Confirmed
              </span>
            </div>

            {/* Quick vitals metrics snapshot */}
            <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-900/50 p-2.5 border border-white/5">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <Activity size={11} className="text-rose-400" />
                  <span>BP</span>
                </div>
                <p className="mt-0.5 text-xs font-bold text-white">118/78</p>
                <span className="text-[9px] text-emerald-400">Normal</span>
              </div>

              <div className="rounded-xl bg-slate-900/50 p-2.5 border border-white/5">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <HeartPulse size={11} className="text-teal-400" />
                  <span>Heart Rate</span>
                </div>
                <p className="mt-0.5 text-xs font-bold text-white">72 bpm</p>
                <span className="text-[9px] text-emerald-400">Optimal</span>
              </div>

              <div className="rounded-xl bg-slate-900/50 p-2.5 border border-white/5">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <Calendar size={11} className="text-blue-400" />
                  <span>Next Visit</span>
                </div>
                <p className="mt-0.5 text-xs font-bold text-white">In 2 hrs</p>
                <span className="text-[9px] text-teal-300">OPD Room 3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Trust Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#3edec9]" />
            <span>NABH Accredited &amp; HIPAA Compliant</span>
          </div>
          <span className="text-slate-300 font-medium">256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: Clean, Focused Authentication Card
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10243e] text-white shadow-md">
              <HeartPulse size={20} strokeWidth={2.4} className="text-[#16b8a6]" />
            </span>
            <span className="text-lg font-bold text-[#10243e]">MediCare</span>
          </Link>

          {/* Home Link */}
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={13} />
            <span>Hospital Home</span>
          </Link>
        </div>

        {/* Center Card */}
        <div className="mx-auto my-auto w-full max-w-[430px] py-8">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-200/40 sm:p-9">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
                Sign In
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Access your personal patient medical portal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email-input"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email-input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password-input"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>

                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                  <span className="font-bold">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Single Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1265b5] text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-900/15 transition hover:bg-[#0e559b] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500">New patient? <Link to="/signup" className="font-semibold text-[#1265b5] hover:underline">Create an account</Link></p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400">
          <p>
            MediCare Health System &copy; 2026. HIPAA compliant patient portal.
          </p>
        </div>
      </div>
    </div>
  );
}
