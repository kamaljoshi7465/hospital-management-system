import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, HeartPulse } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import type { SignupInput } from "../../../api/auth";

const emptyForm: SignupInput = { name: "", email: "", password: "", phone: "", dateOfBirth: "", gender: "OTHER" };
export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const change = (key: keyof SignupInput, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (form.password.length < 12) { setError("Use a password with at least 12 characters."); return; }
    if (form.password !== confirmPassword) { setError("The passwords do not match."); return; }
    setLoading(true); const result = await signup(form); setLoading(false);
    if (!result.success) setError(result.error ?? "Unable to create your account.");
  };
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">
      <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16}/> Hospital Home</Link>
      <div className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#10243e] text-[#16b8a6]"><HeartPulse size={23}/></span><div><h1 className="text-2xl font-bold text-slate-900">Create patient account</h1><p className="text-sm text-slate-500">Your account and patient profile are created securely.</p></div></div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">Full name<input required maxLength={100} autoComplete="name" value={form.name} onChange={e=>change("name",e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        <label className="block text-sm font-medium text-slate-700">Email<input required type="email" autoComplete="email" value={form.email} onChange={e=>change("email",e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">Phone<input required type="tel" maxLength={25} autoComplete="tel" value={form.phone} onChange={e=>change("phone",e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" /></label><label className="block text-sm font-medium text-slate-700">Date of birth<input required type="date" max={new Date().toISOString().slice(0,10)} value={form.dateOfBirth} onChange={e=>change("dateOfBirth",e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" /></label></div>
        <label className="block text-sm font-medium text-slate-700">Gender<select value={form.gender} onChange={e=>change("gender",e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"><option value="OTHER">Other</option><option value="FEMALE">Female</option><option value="MALE">Male</option></select></label>
        <label className="block text-sm font-medium text-slate-700">Password<input required minLength={12} maxLength={72} type="password" autoComplete="new-password" value={form.password} onChange={e=>change("password",e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" /><span className="mt-1 block text-xs font-normal text-slate-500">Use at least 12 characters.</span></label>
        <label className="block text-sm font-medium text-slate-700">Confirm password<input required minLength={12} maxLength={72} type="password" autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1265b5] font-semibold text-white disabled:opacity-60">{loading ? "Creating account…" : <>Create account <ArrowRight size={16}/></>}</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-semibold text-[#1265b5]">Sign in</Link></p>
    </div>
  </div>;
}
