import { useState } from "react";
import {
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  Award,
  IndianRupee,
  Clock,
  Save,
  CheckCircle,
} from "lucide-react";
import { useHospital } from "../../../../context/HospitalContext";

export default function DoctorPortalProfilePage() {
  const { currentDoctor, updateDoctor } = useHospital();

  const [formData, setFormData] = useState({
    name: currentDoctor.name,
    email: currentDoctor.email,
    phone: currentDoctor.phone,
    specialization: currentDoctor.specialization,
    qualification: currentDoctor.qualification,
    experienceYears: currentDoctor.experienceYears,
    consultationFee: currentDoctor.consultationFee,
    bio: currentDoctor.bio,
    image: currentDoctor.image,
    slotDurationMinutes: currentDoctor.slotDurationMinutes,
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateDoctor(currentDoctor.id, {
      ...formData,
      experienceYears: Number(formData.experienceYears),
      consultationFee: Number(formData.consultationFee),
      slotDurationMinutes: Number(formData.slotDurationMinutes),
    });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          Doctor Profile & Clinical Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Update your public profile, consultation fee, bio, and clinical qualifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card Summary Header */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={formData.image || currentDoctor.image}
              alt={currentDoctor.name}
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover ring-4 ring-teal-50 shadow-md"
            />
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200">
              <UserCheck size={13} /> Attending Doctor
            </div>
            <h2 className="text-xl font-bold text-slate-900">{formData.name}</h2>
            <p className="text-xs font-semibold text-teal-600">
              {formData.specialization} · {formData.qualification}
            </p>
            <p className="text-xs text-slate-400">
              Rating: {currentDoctor.rating} ★ ({currentDoctor.totalReviews} reviews) · {formData.experienceYears} Years Clinical Experience
            </p>
          </div>

          <div className="text-center sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-xs text-slate-500">Current OPD Fee</p>
            <p className="text-2xl font-extrabold text-[#1265b5]">
              ₹{formData.consultationFee}
            </p>
            <p className="text-[10px] text-slate-400">Per 30-min consultation</p>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Clinical Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Doctor Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
                />
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department / Specialization
              </label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Medical Degrees & Qualifications
              </label>
              <div className="relative">
                <GraduationCap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MBBS, MD (Medicine)"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Clinical Experience (Years)
              </label>
              <div className="relative">
                <Award size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
                />
              </div>
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                OPD Consultation Fee (₹ INR)
              </label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  required
                  step={50}
                  min={100}
                  max={10000}
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
                />
              </div>
            </div>

            {/* Slot Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default Slot Duration (Minutes)
              </label>
              <div className="relative">
                <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  required
                  step={5}
                  min={15}
                  max={60}
                  value={formData.slotDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
                />
              </div>
            </div>

            {/* Profile Photo URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Profile Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Professional Bio & Clinical Philosophy
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle size={15} /> Changes saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1265b5] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#0e559b] transition"
            >
              <Save size={15} />
              Save Profile Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
