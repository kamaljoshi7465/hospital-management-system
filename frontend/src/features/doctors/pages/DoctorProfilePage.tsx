
import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Star,
  Calendar,
  X,
  Stethoscope,
} from "lucide-react";
import { useHospital } from "../../../context/HospitalContext";
import type { Doctor } from "../../../types";

const SPECIALTIES = [
  "ALL",
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedic Surgeon",
  "Dermatologist",
];

export default function DoctorProfilePage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialSpecialty = searchParams.get("specialty") || "ALL";

  const { doctors } = useHospital();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      if (selectedSpecialty !== "ALL" && doc.specialization !== selectedSpecialty) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesSpec = doc.specialization.toLowerCase().includes(q);
        const matchesQual = doc.qualification.toLowerCase().includes(q);
        const matchesBio = doc.bio.toLowerCase().includes(q);
        return matchesName || matchesSpec || matchesQual || matchesBio;
      }
      return true;
    });
  }, [doctors, selectedSpecialty, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Medical Faculty & Consultants
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-[#152a43] sm:text-4xl">
            Our Specialist Doctors
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl">
            Consult with certified medical consultants across specialized healthcare
            fields. Book an in-person or video consultation directly.
          </p>
        </div>

        <Link
          to="/patient/book"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1265b5] px-5 text-xs font-semibold text-white shadow-md transition hover:bg-[#0e559b]"
        >
          <Calendar size={16} />
          Book Instant Slot
        </Link>
      </div>

      {/* Search & Specialty Filter */}
      <div className="mb-8 flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative max-w-lg">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search by doctor name, specialty, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10 shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => setSelectedSpecialty(spec)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition shrink-0 ${
                selectedSpecialty === spec
                  ? "bg-[#10243e] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {spec === "ALL" ? "All Specialties" : spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition hover:border-slate-300 hover:shadow-md"
            >
              <div>
                {/* Doctor Image Header */}
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 backdrop-blur-xs flex items-center gap-1 shadow-sm">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    {doc.rating}{" "}
                    <span className="text-[10px] text-slate-400">({doc.totalReviews})</span>
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-lg bg-[#10243e]/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                    {doc.experienceYears} Years Experience
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    {doc.specialization}
                  </span>
                  <h3 className="text-lg font-bold text-[#152a43] mt-0.5">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {doc.qualification}
                  </p>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {doc.bio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1">
                    {doc.workingDays.slice(0, 4).map((day) => (
                      <span
                        key={day}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                      >
                        {day.substring(0, 3)}
                      </span>
                    ))}
                    {doc.workingDays.length > 4 && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                        +{doc.workingDays.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Consultation
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    ₹{doc.consultationFee}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileDoctor(doc)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Profile
                  </button>
                  <Link
                    to={`/patient/book/${doc.id}`}
                    className="rounded-xl bg-[#1265b5] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0e559b] shadow-xs"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Stethoscope size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            No specialists found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any doctor matching "{searchQuery}". Try selecting another
            specialty or clear your search term.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedSpecialty("ALL");
            }}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Doctor Detailed Profile Modal */}
      {profileDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-800">
                  Accepting Consultations
                </span>
              </div>
              <button
                type="button"
                onClick={() => setProfileDoctor(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={profileDoctor.image}
                  alt={profileDoctor.name}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#152a43]">
                    {profileDoctor.name}
                  </h3>
                  <p className="text-xs font-semibold text-teal-700">
                    {profileDoctor.specialization}
                  </p>
                  <p className="text-xs text-slate-500">
                    {profileDoctor.qualification}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-bold">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      {profileDoctor.rating} ({profileDoctor.totalReviews} reviews)
                    </span>
                    <span>·</span>
                    <span>{profileDoctor.experienceYears} Years Exp</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  About & Clinical Focus
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed rounded-xl bg-slate-50 p-3">
                  {profileDoctor.bio}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    OPD Timings
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {profileDoctor.workingHours.start} – {profileDoctor.workingHours.end}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Consultation Fee
                  </span>
                  <p className="text-xs font-bold text-teal-700 mt-0.5">
                    ₹{profileDoctor.consultationFee}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Available Consultation Days
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profileDoctor.workingDays.map((day) => (
                    <span
                      key={day}
                      className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProfileDoctor(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <Link
                to={`/patient/book/${profileDoctor.id}`}
                className="rounded-xl bg-[#1265b5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0e559b] shadow-xs"
              >
                Schedule Appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
