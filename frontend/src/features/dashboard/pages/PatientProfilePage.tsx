
import { useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  HeartPulse,
  Activity,
  Pill,
  AlertTriangle,
  ShieldCheck,
  Edit2,
  Plus,
  X,
  RefreshCw,
} from "lucide-react";
import { useHospital } from "../../../context/HospitalContext";
import type { Gender } from "../../../types";

function calculateAge(dobString: string): number {
  const birthDate = new Date(dobString);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function calculateBMI(weightKg: number, heightCm: number): { value: number | null; label: string } {
  if (!weightKg || !heightCm) return { value: null, label: "Not recorded" };
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  let label = "Normal";
  if (bmi < 18.5) label = "Underweight";
  else if (bmi >= 25 && bmi < 30) label = "Overweight";
  else if (bmi >= 30) label = "Obese";
  return { value: bmi, label };
}

export default function PatientProfilePage() {
  const { currentPatient, updatePatient, updateVitals, resetDemoData, addToast } = useHospital();

  // Modals
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [logVitalsOpen, setLogVitalsOpen] = useState(false);

  // Edit Profile Form State
  const [fullName, setFullName] = useState(currentPatient.fullName);
  const [phone, setPhone] = useState(currentPatient.phone);
  const [email, setEmail] = useState(currentPatient.email);
  const [bloodGroup, setBloodGroup] = useState(currentPatient.bloodGroup);
  const [city, setCity] = useState(currentPatient.address.city);
  const [state, setState] = useState(currentPatient.address.state);
  const [gender, setGender] = useState<Gender>(currentPatient.gender);

  // Vitals Form State
  const vitals = currentPatient.vitals || {
    bloodPressure: "",
    heartRate: 0,
    bloodSugar: 0,
    weightKg: 0,
    heightCm: 0,
    temperatureF: 0,
    lastUpdated: "",
  };

  const [bp, setBp] = useState(vitals.bloodPressure);
  const [hr, setHr] = useState(vitals.heartRate.toString());
  const [sugar, setSugar] = useState(vitals.bloodSugar.toString());
  const [weight, setWeight] = useState(vitals.weightKg.toString());
  const [height, setHeight] = useState(vitals.heightCm.toString());

  const age = calculateAge(currentPatient.dateOfBirth);
  const bmi = calculateBMI(vitals.weightKg, vitals.heightCm);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient({
      fullName,
      phone,
      email,
      bloodGroup,
      gender,
      address: {
        ...currentPatient.address,
        city,
        state,
      },
    });
    setEditProfileOpen(false);
  };

  const handleVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bp.trim() || [hr, sugar, weight, height].some(value => !value || Number(value) <= 0)) {
      addToast("Check vitals", "Enter a blood pressure and positive values for each measurement.", "error");
      return;
    }
    updateVitals({
      bloodPressure: bp,
      heartRate: Number(hr),
      bloodSugar: Number(sugar),
      weightKg: Number(weight),
      heightCm: Number(height),
    });
    setLogVitalsOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header Profile Banner */}
      <section className="mb-7 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#10243e] text-2xl font-bold text-white shadow-md">
              {currentPatient.fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#152a43] sm:text-3xl">
                  {currentPatient.fullName}
                </h1>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-600/20">
                  Active Patient
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20">
                  Blood Group: {currentPatient.bloodGroup}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <UserRound size={14} className="text-slate-400" />
                  {currentPatient.gender} · {age} years old
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  {currentPatient.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  {currentPatient.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  {currentPatient.address.city}, {currentPatient.address.state}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditProfileOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 shrink-0"
          >
            <Edit2 size={14} />
            Edit Profile
          </button>
        </div>
      </section>

      {/* Grid: Left Vitals & Clinical, Right Contacts & History */}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-7">
          {/* Health Vitals Tracker */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="mb-5 flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Health Vitals & Metrics
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Last monitored on {vitals.lastUpdated}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLogVitalsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100"
              >
                <Plus size={14} />
                Log New Vitals
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Blood Pressure
                </span>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                  {vitals.bloodPressure}
                </p>
                <p className="mt-1 text-[11px] font-medium text-emerald-600">
                  Normal Range
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Heart Rate
                </span>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                  {vitals.heartRate}{" "}
                  <span className="text-xs font-normal text-slate-400">bpm</span>
                </p>
                <p className="mt-1 text-[11px] font-medium text-emerald-600">
                  Resting Pulse
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Blood Sugar
                </span>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                  {vitals.bloodSugar}{" "}
                  <span className="text-xs font-normal text-slate-400">mg/dL</span>
                </p>
                <p className="mt-1 text-[11px] font-medium text-emerald-600">
                  Fasting Glycemia
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  BMI & Weight
                </span>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                  {bmi.value ?? "—"}{" "}
                  <span className="text-xs font-normal text-slate-400">({bmi.label})</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {vitals.weightKg} kg · {vitals.heightCm} cm
                </p>
              </div>
            </div>
          </section>

          {/* Active Prescriptions */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill size={18} className="text-teal-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Active Prescriptions & Regimen
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {currentPatient.medications?.length ?? 0} Prescriptions
              </span>
            </div>

            <div className="space-y-3">
              {currentPatient.medications && currentPatient.medications.length > 0 ? (
                currentPatient.medications.map((med) => (
                  <div
                    key={med.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{med.name}</p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            med.refillStatus === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {med.refillStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {med.dosage} · {med.frequency}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Prescribed by {med.doctor}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0"
                    >
                      Request Refill
                    </button>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">
                  No active prescription medications recorded.
                </p>
              )}
            </div>
          </section>

          {/* Allergies & Clinical History */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Allergies & Medical History
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 mb-2">
                  <AlertTriangle size={15} />
                  Known Drug & Environmental Allergies
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentPatient.allergies && currentPatient.allergies.length > 0 ? (
                    currentPatient.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/20"
                      >
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No known allergies reported</span>
                  )}
                </div>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <HeartPulse size={15} className="text-teal-600" />
                  Chronic Medical Conditions
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentPatient.chronicConditions && currentPatient.chronicConditions.length > 0 ? (
                    currentPatient.chronicConditions.map((condition) => (
                      <span
                        key={condition}
                        className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20"
                      >
                        {condition}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None recorded</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Rail: Emergency Contacts & Quick Actions */}
        <aside className="space-y-6">
          {/* Emergency Contact */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <ShieldCheck size={18} className="text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Emergency Contact
              </h3>
            </div>

            {currentPatient.emergencyContact ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Contact Person</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {currentPatient.emergencyContact.name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Relationship</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {currentPatient.emergencyContact.relationship}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Phone Number</span>
                  <p className="font-bold text-teal-700 mt-0.5">
                    {currentPatient.emergencyContact.phone}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No emergency contact provided.</p>
            )}
          </section>

          {/* Account Reset & System Info */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              System & Demo Controls
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              MediCare stores all booked visits, vitals, and profile adjustments
              locally in your browser session.
            </p>

            <button
              type="button"
              onClick={resetDemoData}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              <RefreshCw size={14} />
              Reset Demo Records
            </button>
          </section>
        </aside>
      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Patient Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#10243e] px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Vitals Modal */}
      {logVitalsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Record Health Vitals
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLogVitalsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVitalsSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Pressure (Systolic/Diastolic)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    required
                    value={hr}
                    onChange={(e) => setHr(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    required
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLogVitalsOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
