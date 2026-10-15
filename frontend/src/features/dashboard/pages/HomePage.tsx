
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Stethoscope,
  CalendarPlus,
  Video,
  ShieldCheck,
  ArrowRight,
  Search,
  PhoneCall,
  Activity,
  Award,
  Users,
  ChevronRight,
  Star,
} from "lucide-react";
import { useHospital } from "../../../context/HospitalContext";

const DEPARTMENTS = [
  {
    name: "General Medicine",
    icon: Stethoscope,
    desc: "Preventive health checkups, chronic disease management, and internal medicine.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    name: "Cardiology",
    icon: HeartPulse,
    desc: "Comprehensive heart screening, ECG, hypertension, and post-cardiac recovery.",
    color: "bg-rose-50 text-rose-700",
  },
  {
    name: "Neurology",
    icon: Activity,
    desc: "Migraine therapy, stroke rehabilitation, neuropathies, and epilepsy care.",
    color: "bg-teal-50 text-teal-700",
  },
  {
    name: "Pediatrics",
    icon: Users,
    desc: "Newborn immunization, developmental checkups, and pediatric illness treatments.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    name: "Orthopedics",
    icon: Award,
    desc: "Joint pain management, sports injury rehabilitation, and bone fractures.",
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    name: "Dermatology",
    icon: ShieldCheck,
    desc: "Clinical skin therapy, acne scar reduction, hair loss, and cosmetic lasers.",
    color: "bg-emerald-50 text-emerald-700",
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { doctors } = useHospital();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctor?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/doctor");
    }
  };

  return (
    <div className="bg-[#fcfdfe]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#10243e] to-[#153457] py-16 sm:py-24 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6fead9] ring-1 ring-teal-400/20">
                <ShieldCheck size={14} />
                NABH Accredited Healthcare Network
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
                Healthcare Made <span className="text-[#3edec9]">Simpler</span>, Smarter & Human.
              </h1>

              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
                Schedule in-person clinic visits or encrypted video consultations with verified specialists.
                Manage your appointments, health vitals, and medical prescriptions in one portal.
              </p>

              {/* Interactive Search Bar */}
              <form onSubmit={handleSearchSubmit} className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl bg-white p-2 shadow-xl">
                <Search size={18} className="text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search doctor name, specialty, or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-2 text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#1265b5] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0e559b] shrink-0"
                >
                  Find Care
                </button>
              </form>

              {/* Quick Actions */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/patient/book"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-md shadow-teal-900/30 transition hover:bg-teal-400"
                >
                  <CalendarPlus size={16} />
                  Book Appointment
                </Link>

                <Link
                  to="/patient/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20"
                >
                  Open Patient Portal
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Key Highlights */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-2xl font-extrabold text-white">50+</p>
                  <p className="mt-0.5 text-xs text-slate-400">Certified Specialists</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">15K+</p>
                  <p className="mt-0.5 text-xs text-slate-400">Patients Managed</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-teal-400">99.4%</p>
                  <p className="mt-0.5 text-xs text-slate-400">Positive Feedback</p>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Preview */}
            <div className="relative hidden lg:block">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/20 text-[#6fead9]">
                      <HeartPulse size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Instant OPD Scheduling</p>
                      <p className="text-xs text-slate-300">Live doctor availability</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    Online Now
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {doctors.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 p-3.5 transition hover:bg-slate-900/60"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="h-11 w-11 rounded-xl object-cover ring-2 ring-teal-400/30"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{doc.name}</p>
                          <p className="text-[11px] text-teal-300">{doc.specialization}</p>
                          <p className="text-[10px] text-slate-400">
                            ★ {doc.rating} ({doc.totalReviews} reviews)
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/patient/book/${doc.id}`}
                        className="rounded-xl bg-teal-500/20 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-500 hover:text-slate-950 transition"
                      >
                        Book (₹{doc.consultationFee})
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-teal-500/10 p-4 border border-teal-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                    <Video size={16} />
                    Telemedicine Available 24/7
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
                    Connect face-to-face from your phone with an on-duty medical officer within 15 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties & Departments Section */}
      <section className="py-16 sm:py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Center of Excellence
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-[#10243e] sm:text-4xl">
            Specialized Medical Departments
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500">
            World-class diagnostic technology and seasoned doctors across every critical discipline.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.name}
                className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-teal-500/40 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-4 ${dept.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-base font-bold text-[#152a43] group-hover:text-teal-700 transition">
                  {dept.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {dept.desc}
                </p>
                <Link
                  to={`/doctor?specialty=${encodeURIComponent(dept.name)}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1265b5] hover:text-[#0e559b]"
                >
                  View specialists
                  <ChevronRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top Specialists Grid */}
      <section className="bg-slate-50/80 py-16 sm:py-20 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
                Our Medical Team
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#10243e]">
                Meet Our Certified Doctors
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Experienced practitioners dedicated to personalized patient treatment.
              </p>
            </div>

            <Link
              to="/doctor"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Explore all doctors
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800 backdrop-blur-xs flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    {doc.rating}
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    {doc.specialization}
                  </span>
                  <h3 className="text-base font-bold text-[#152a43] mt-0.5">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-slate-400">{doc.qualification}</p>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <div>
                      <span className="text-slate-400">Consultation</span>
                      <p className="font-bold text-slate-800">₹{doc.consultationFee}</p>
                    </div>

                    <Link
                      to={`/patient/book/${doc.id}`}
                      className="rounded-xl bg-[#1265b5] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0e559b]"
                    >
                      Book Visit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Step Process: How It Works */}
      <section className="py-16 sm:py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Streamlined Workflow
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-[#10243e] sm:text-4xl">
            How MediCare Works
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500">
            Getting high-quality clinical consultation has never been easier.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 text-xl font-extrabold">
              1
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Select Specialist & Mode
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Browse doctor profiles by department, clinical ratings, and choose in-person visit or telehealth video.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 text-xl font-extrabold">
              2
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Pick Date & Time Slot
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Choose your ideal 30-minute slot with real-time schedule conflict prevention and instant confirmation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 text-xl font-extrabold">
              3
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Consult & Access Records
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Attend your consultation and find your prescriptions, medical notes, and follow-ups in your patient portal.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Callout Banner */}
      <section className="bg-gradient-to-r from-[#12375a] to-[#10243e] py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-600/30 text-rose-400 ring-2 ring-rose-500/40">
              <PhoneCall size={28} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold">24/7 Medical Emergency Response</h3>
              <p className="mt-1 text-xs text-slate-300">
                Immediate ambulance dispatch, ICU beds, and trauma surgical units standing by.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:108"
              className="rounded-xl bg-rose-600 px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-rose-700"
            >
              Call Ambulance: 108
            </a>
            <a
              href="tel:18006334227"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/20"
            >
              1800-MEDICARE
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}