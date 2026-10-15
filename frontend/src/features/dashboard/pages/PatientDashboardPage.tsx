
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock3,
  HeartPulse,
  Search,
  ShieldCheck,
  Stethoscope,
  Video,
} from "lucide-react";

import { useHospital } from "../../../context/HospitalContext";
import type { Appointment, AppointmentStatus } from "../../../types";

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T12:00:00+05:30`));
}

function formatLongDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T12:00:00+05:30`));
}

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getStatusClasses(status: AppointmentStatus): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
    case "BOOKED":
      return "bg-blue-50 text-blue-700 ring-blue-600/15";
    case "COMPLETED":
      return "bg-slate-100 text-slate-600 ring-slate-500/15";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 ring-rose-600/15";
    case "NO_SHOW":
      return "bg-amber-50 text-amber-700 ring-amber-600/15";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/15";
  }
}

function getStatusLabel(status: AppointmentStatus): string {
  return status === "NO_SHOW"
    ? "No show"
    : status.charAt(0) + status.slice(1).toLowerCase();
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getAppointmentDateTime(appointment: Appointment): number {
  return new Date(
    `${appointment.appointmentDate}T${appointment.startTime}:00+05:30`,
  ).getTime();
}

export default function PatientDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { currentPatient, appointments, doctors, startVideoCall } = useHospital();

  const primaryDoctor = doctors[0];

  const patientAppointments = useMemo(
    () => appointments.filter((item) => item.patientId === currentPatient.id),
    [appointments, currentPatient.id],
  );

  const [now] = useState(() => Date.now());

  const upcomingAppointments = useMemo(
    () =>
      patientAppointments
        .filter(
          (item) =>
            ["BOOKED", "CONFIRMED"].includes(item.status) &&
            getAppointmentDateTime(item) >= now,
        )
        .sort(
          (a, b) =>
            getAppointmentDateTime(a) - getAppointmentDateTime(b),
        ),
    [patientAppointments, now],
  );

  const nextAppointment = upcomingAppointments[0];
  const nextDoctor = nextAppointment
    ? doctors.find((d) => d.id === nextAppointment.doctorId)
    : undefined;

  const completedCount = patientAppointments.filter(
    (item) => item.status === "COMPLETED",
  ).length;

  const cancelledCount = patientAppointments.filter(
    (item) => item.status === "CANCELLED",
  ).length;

  const filteredAppointments = patientAppointments
    .filter((item) => {
      const doc = doctors.find((d) => d.id === item.doctorId);
      const matchesSearch =
        !searchTerm ||
        item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc?.specialization.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort(
      (a, b) =>
        getAppointmentDateTime(b) - getAppointmentDateTime(a),
    )
    .slice(0, 5);

  const firstName = currentPatient.fullName.split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Page Heading & Quick Action */}
      <section className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-teal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Your personal health space
          </div>
          <h1 className="text-[27px] font-bold tracking-[-0.04em] text-[#152a43] sm:text-[32px]">
            Good to see you, {firstName}
            <span className="ml-2">👋</span>
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-slate-500">
            Here’s your health overview. Stay on top of your consultations and
            manage appointments seamlessly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/patient/profile"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <Activity size={15} className="text-teal-600" />
            Health Vitals
          </Link>
          <Link
            to="/patient/book"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1265b5] px-5 text-[12px] font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#0e559b] hover:shadow-xl"
          >
            <CalendarPlus size={16} />
            Book an appointment
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Next Appointment Spotlight Banner */}
      <section className="relative mb-7 overflow-hidden rounded-[24px] bg-[#12375a] text-white shadow-[0_14px_40px_-20px_rgba(18,55,90,0.5)]">
        <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full border border-white/[0.08]" />
        <div className="pointer-events-none absolute -right-1 -top-16 h-60 w-60 rounded-full border border-white/[0.08]" />
        <div className="pointer-events-none absolute bottom-[-100px] right-[28%] h-52 w-52 rounded-full bg-teal-400/[0.08] blur-3xl" />

        <div className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-9 lg:py-8">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-teal-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#78ead9] ring-1 ring-teal-300/20">
                <CalendarDays size={12} />
                Next consultation
              </span>
              {nextAppointment && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-200">
                  {getStatusLabel(nextAppointment.status)}
                </span>
              )}
            </div>

            {nextAppointment ? (
              <>
                <p className="text-sm font-medium text-blue-100/80">
                  {formatLongDate(nextAppointment.appointmentDate)}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-[30px]">
                  {formatTime(nextAppointment.startTime)} – {formatTime(nextAppointment.endTime)}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-blue-100/80">
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={14} className="text-teal-300" />
                    30-minute consultation
                  </span>
                  <span className="flex items-center gap-1.5">
                    {nextAppointment.consultationType === "ONLINE" ? (
                      <Video size={14} className="text-teal-300" />
                    ) : (
                      <Stethoscope size={14} className="text-teal-300" />
                    )}
                    {nextAppointment.consultationType === "ONLINE"
                      ? "Online Video Consultation"
                      : "In-Person Clinic Visit"}
                  </span>
                  <span className="text-blue-200/60 font-mono">
                    ID: #{nextAppointment.id}
                  </span>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold tracking-tight">
                  No upcoming appointments
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100/75">
                  Schedule your next consultation with our certified specialists
                  and keep your health monitored.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[270px] lg:items-end">
            {nextAppointment && (
              <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xs">
                {nextDoctor?.image ? (
                  <img
                    src={nextDoctor.image}
                    alt={nextDoctor.name}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-teal-400/40"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#1b507c]">
                    {getInitials(nextDoctor?.name ?? "Doctor")}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-blue-100/65">
                    Consulting with
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {nextDoctor?.name ?? "Doctor"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-teal-300">
                    {nextDoctor?.specialization}
                  </p>
                </div>
              </div>
            )}

            <div className="flex w-full flex-wrap gap-2 lg:justify-end">
              {nextAppointment?.consultationType === "ONLINE" && (
                <button
                  type="button"
                  onClick={() => startVideoCall(nextAppointment)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 text-xs font-semibold text-slate-950 transition hover:bg-teal-400"
                >
                  <Video size={15} />
                  Join Video Call
                </button>
              )}

              <Link
                to="/patient/appointments"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#173b5d] transition hover:bg-blue-50"
              >
                Manage visits
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Stat Cards */}
      <section className="mb-8 grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:grid-cols-4 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2875bd]">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Upcoming</p>
            <p className="mt-1 text-[26px] font-bold leading-none tracking-tight text-[#17314d]">
              {upcomingAppointments.length}
            </p>
            <p className="mt-1.5 text-[10px] text-slate-400">Scheduled visits</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 sm:border-l sm:border-slate-200/80 sm:pl-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Check size={21} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Completed</p>
            <p className="mt-1 text-[26px] font-bold leading-none tracking-tight text-[#17314d]">
              {completedCount}
            </p>
            <p className="mt-1.5 text-[10px] text-slate-400">Past consultations</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 sm:border-l sm:border-slate-200/80 sm:pl-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total visits</p>
            <p className="mt-1 text-[26px] font-bold leading-none tracking-tight text-[#17314d]">
              {patientAppointments.length}
            </p>
            <p className="mt-1.5 text-[10px] text-slate-400">All medical records</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 sm:border-l sm:border-slate-200/80 sm:pl-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <ArrowDownRight size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Cancelled</p>
            <p className="mt-1 text-[26px] font-bold leading-none tracking-tight text-[#17314d]">
              {cancelledCount}
            </p>
            <p className="mt-1.5 text-[10px] text-slate-400">Cancelled visits</p>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Appointment Table & Right Info Rail */}
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left Column: Appointments List */}
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#172d47]">
                Appointment History
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your recent and upcoming consultations
              </p>
            </div>
            <Link
              to="/patient/appointments"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1768b4] hover:text-[#104d88]"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick search input */}
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 shadow-2xs">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="search"
              placeholder="Filter by reason or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Appointments Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(120px,0.8fr)_minmax(110px,0.7fr)] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-400 sm:grid">
              <span>Appointment & Doctor</span>
              <span>Date & Time</span>
              <span>Status & Mode</span>
            </div>

            {filteredAppointments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredAppointments.map((appointment) => {
                  const doc = doctors.find((d) => d.id === appointment.doctorId);
                  return (
                    <div
                      key={appointment.id}
                      className="grid gap-3 px-4 py-4 transition hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1.4fr)_minmax(120px,0.8fr)_minmax(110px,0.7fr)] sm:items-center sm:gap-4 sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf5fc] text-[#2c6da4]">
                          {appointment.consultationType === "ONLINE" ? (
                            <Video size={18} />
                          ) : (
                            <Stethoscope size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800">
                            {appointment.reason}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-slate-500">
                            {doc?.name ?? "Specialist"} · {doc?.specialization}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Fee: ₹{doc?.consultationFee ?? 600}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:block">
                        <div>
                          <p className="text-[11px] font-semibold text-slate-700">
                            {formatDate(appointment.appointmentDate)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset sm:hidden ${getStatusClasses(
                            appointment.status,
                          )}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>

                      <div className="hidden sm:flex sm:flex-col sm:items-start sm:gap-1">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${getStatusClasses(
                            appointment.status,
                          )}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {appointment.consultationType === "ONLINE" ? "Online Video" : "In-Person Visit"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <CalendarDays size={22} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No appointments found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try another search or book a new consultation.
                </p>
                <Link
                  to="/patient/book"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1265b5] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0e559b]"
                >
                  <CalendarPlus size={14} />
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Patient Safety Notice */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-[#edf6ff] p-4 sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#2675b9] shadow-xs">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#214d76]">
                Health Reminder for Your Consultations
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#56718c]">
                Please keep any recent diagnostic reports or medication slips ready before
                your appointment. For online visits, test your camera and audio beforehand.
              </p>
            </div>
          </div>
        </section>

        {/* Right Rail: Doctor Preview & Daily Vitals */}
        <aside className="space-y-6">
          {/* Doctor Spotlight Card */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <div>
                <h2 className="text-sm font-bold text-[#172d47]">Featured Doctor</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Available this week</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Stethoscope size={17} />
              </span>
            </div>

            {primaryDoctor && (
              <>
                <div className="mx-5 mt-2 rounded-xl bg-[#f2f7fc] p-4">
                  <div className="flex items-center gap-3">
                    {primaryDoctor.image ? (
                      <img
                        src={primaryDoctor.image}
                        alt={primaryDoctor.name}
                        className="h-14 w-14 rounded-2xl object-cover ring-2 ring-blue-100"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#dcecf9] text-base font-bold text-[#205681]">
                        {getInitials(primaryDoctor.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1a3551]">
                        {primaryDoctor.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-600">
                        {primaryDoctor.specialization}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {primaryDoctor.qualification}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500">Exp.</p>
                      <p className="mt-0.5 text-xs font-bold text-slate-700">
                        {primaryDoctor.experienceYears}y
                      </p>
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                      <p className="text-[10px] text-slate-500">Fee</p>
                      <p className="mt-0.5 text-xs font-bold text-slate-700">
                        ₹{primaryDoctor.consultationFee}
                      </p>
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                      <p className="text-[10px] text-slate-500">Rating</p>
                      <p className="mt-0.5 flex items-center justify-center gap-1 text-xs font-bold text-slate-700">
                        <span className="text-amber-500">★</span>
                        {primaryDoctor.rating}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Accepting in-person & online consultations
                  </div>
                  <Link
                    to={`/patient/book/${primaryDoctor.id}`}
                    className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1265b5] text-xs font-semibold text-white shadow-xs transition hover:bg-[#0e559b]"
                  >
                    Book Consultation
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}
          </section>

          {/* Health Vitals Summary Card */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#172d47]">Health Vitals</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Last updated {currentPatient.vitals?.lastUpdated || "recently"}
                </p>
              </div>
              <Activity size={18} className="text-teal-600" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] text-slate-400 font-medium">Blood Pressure</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {currentPatient.vitals?.bloodPressure || "120/80"} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] text-slate-400 font-medium">Heart Rate</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {currentPatient.vitals?.heartRate || 72} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] text-slate-400 font-medium">Blood Sugar</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {currentPatient.vitals?.bloodSugar || 95} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] text-slate-400 font-medium">Weight</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {currentPatient.vitals?.weightKg || 71} <span className="text-[10px] font-normal text-slate-400">kg</span>
                </p>
              </div>
            </div>

            <Link
              to="/patient/profile"
              className="mt-4 flex items-center justify-between text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              <span>View full medical history</span>
              <ArrowRight size={14} />
            </Link>
          </section>

          {/* Today's Overview & Daily Tip */}
          <section className="rounded-2xl bg-[#e8f7f5] p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-700 shadow-xs">
              <HeartPulse size={19} />
            </div>
            <h2 className="mt-3 text-sm font-bold text-[#174e4b]">
              Preventive Healthcare Tip
            </h2>
            <p className="mt-1.5 text-[11px] leading-5 text-[#4b7774]">
              Stay hydrated with 2.5–3 liters of water daily. Taking 10-minute
              active walks helps maintain stable blood pressure and cardiovascular fitness.
            </p>
            <Link
              to="/doctor"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#087c72] hover:text-[#065d56]"
            >
              Explore all hospital specialists
              <ArrowRight size={14} />
            </Link>
          </section>
        </aside>
      </div>

      {/* Footer */}
      <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200/80 py-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 MediCare Hospital Management Platform. All rights reserved.</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} />
          Your personal health information is strictly protected
        </span>
      </footer>
    </div>
  );
}
