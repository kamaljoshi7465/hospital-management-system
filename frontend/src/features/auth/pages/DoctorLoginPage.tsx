
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function DoctorLoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password, "doctor");

    if (!result.success) {
      setError(result.error ?? "Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10243e] text-white shadow-md">
            <HeartPulse size={20} strokeWidth={2.4} className="text-[#16b8a6]" />
          </span>
          <span className="text-lg font-bold text-[#10243e]">MediCare</span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition hover:bg-slate-50"
        >
          <ArrowLeft size={13} />
          Hospital Home
        </Link>
      </div>

      {/* Center Card */}
      <div className="mx-auto my-auto w-full max-w-[460px] px-4 py-8">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-200/40 sm:p-9">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0e3e6b] text-white shadow-md">
              <Stethoscope size={22} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Doctor Sign In
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Access your clinical workspace
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="doctor-email"
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
                  id="doctor-email"
                  type="email"
                  autoComplete="email"
                  placeholder="doctor@example.com"
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
                  htmlFor="doctor-password"
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
                  id="doctor-password"
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

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                <span className="font-bold">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
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
                  <span>Sign In to Doctor Portal</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Switch to patient */}
          <p className="mt-5 text-center text-xs text-slate-400">
            Are you a patient?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#1265b5] hover:underline"
            >
              Patient Login →
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 text-center text-xs text-slate-400">
        <p>MediCare Health System © 2026. Secure clinical portal.</p>
      </div>
    </div>
  );
}
