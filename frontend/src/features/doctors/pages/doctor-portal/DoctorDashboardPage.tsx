import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Users,
  Video,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import StatCard from "../../../../components/ui/StatCard";
import StatusBadge from "../../../../components/ui/StatusBadge";
import { useHospital } from "../../../../context/HospitalContext";

export default function DoctorDashboardPage() {
  const {
    currentDoctor,
    appointments,
    patients,
    updateAppointmentStatus,
    startVideoCall,
  } = useHospital();

  const todayStr = new Date().toISOString().split("T")[0];

  const doctorAppointments = appointments.filter(
    (a) => a.doctorId === currentDoctor.id,
  );

  const todayAppointments = doctorAppointments.filter(
    (a) => a.appointmentDate === todayStr,
  );

  const pendingToday = todayAppointments.filter((a) =>
    ["BOOKED", "CONFIRMED"].includes(a.status),
  );

  const completedCount = doctorAppointments.filter(
    (a) => a.status === "COMPLETED",
  ).length;

  // Unique patient count
  const uniquePatientIds = new Set(doctorAppointments.map((a) => a.patientId));

  const upcomingList = doctorAppointments
    .filter((a) => a.status !== "CANCELLED")
    .sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
      const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 6);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#10243e] via-[#173c5b] to-[#1265b5] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              Physician OPD Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentDoctor.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200">
              {currentDoctor.specialization} · {currentDoctor.qualification}. You have{" "}
              <strong className="text-white font-semibold underline underline-offset-4 decoration-teal-400">
                {pendingToday.length} appointment{pendingToday.length === 1 ? "" : "s"} scheduled today
              </strong>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/doctor-portal/appointments"
              className="inline-flex items-center gap-2 rounded-xl bg-[#16b8a6] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#139f8f] transition"
            >
              <CalendarDays size={16} />
              <span>Manage OPD Queue</span>
            </Link>
            <Link
              to="/doctor-portal/schedule"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 transition border border-white/10"
            >
              <Clock size={16} />
              <span>Availability Hours</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          description={`${pendingToday.length} waiting for consult`}
          icon={<CalendarCheck size={22} />}
        />
        <StatCard
          title="Total Consultations"
          value={completedCount}
          description="Successfully attended"
          icon={<CheckCircle2 size={22} />}
        />
        <StatCard
          title="Total Patients"
          value={uniquePatientIds.size}
          description="Under your medical care"
          icon={<Users size={22} />}
        />
        <StatCard
          title="Patient Rating"
          value={`${currentDoctor.rating} ★`}
          description={`Based on ${currentDoctor.totalReviews} reviews`}
          icon={<TrendingUp size={22} />}
        />
      </div>

      {/* Main Grid: Upcoming Consultations & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Consultations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Next In Line Appointments
              </h2>
              <p className="text-xs text-slate-500">
                Patients queued for in-person and telemedicine consultation
              </p>
            </div>
            <Link
              to="/doctor-portal/appointments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1265b5] hover:text-[#0e559b]"
            >
              View all ({doctorAppointments.length})
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            {upcomingList.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {upcomingList.map((apt) => {
                  const patient = patients.find((p) => p.id === apt.patientId);
                  const isTelehealth = apt.consultationType === "ONLINE";
                  const isToday = apt.appointmentDate === todayStr;

                  return (
                    <div
                      key={apt.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
                          {patient
                            ? patient.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "PT"}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900 text-sm">
                              {patient?.fullName ?? `Patient #${apt.patientId}`}
                            </span>
                            <StatusBadge status={apt.status} />
                            {isToday && (
                              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200">
                                TODAY
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">
                            Reason: {apt.reason}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>
                              {apt.appointmentDate} · {apt.startTime} - {apt.endTime}
                            </span>
                            <span>•</span>
                            <span className="capitalize text-slate-600 font-medium">
                              {apt.consultationType.toLowerCase()} Consult
                            </span>
                            {patient && (
                              <>
                                <span>•</span>
                                <span>Blood: {patient.bloodGroup}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Doctor quick controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {isTelehealth && apt.status !== "COMPLETED" && (
                          <button
                            type="button"
                            onClick={() => startVideoCall(apt)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
                          >
                            <Video size={13} />
                            Start Call
                          </button>
                        )}

                        {apt.status !== "COMPLETED" && (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(apt.id, "COMPLETED")}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                          >
                            <CheckCircle2 size={13} />
                            Complete
                          </button>
                        )}

                        {["BOOKED", "CONFIRMED"].includes(apt.status) && (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(apt.id, "CANCELLED")}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  No appointments scheduled
                </p>
                <p className="text-xs text-slate-400">
                  New patient bookings will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Doctor Profile Card & Availability Summary */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <img
                src={currentDoctor.image}
                alt={currentDoctor.name}
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {currentDoctor.name}
                </h3>
                <p className="text-xs text-teal-600 font-medium">
                  {currentDoctor.specialization}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentDoctor.qualification}
                </p>
              </div>
            </div>

            <div className="py-3.5 space-y-2.5 text-xs border-b border-slate-100">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-500">
                  <Mail size={13} /> Email
                </span>
                <span className="font-medium text-slate-800 truncate max-w-[170px]">
                  {currentDoctor.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-500">
                  <Phone size={13} /> Phone
                </span>
                <span className="font-medium text-slate-800">
                  +91 {currentDoctor.phone}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">OPD Consultation Fee</span>
                <span className="font-bold text-slate-900 text-sm">
                  ₹{currentDoctor.consultationFee}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Experience</span>
                <span className="font-medium text-slate-800">
                  {currentDoctor.experienceYears} Years
                </span>
              </div>
            </div>

            <div className="pt-3.5">
              <Link
                to="/doctor-portal/profile"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition border border-slate-200/80"
              >
                <UserCheck size={14} />
                Edit Profile & Consultation Fee
              </Link>
            </div>
          </div>

          {/* Schedule Summary Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Working Schedule
              </h3>
              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                {currentDoctor.available ? "Active" : "On Leave"}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">OPD Hours:</span>
                <span className="font-semibold text-slate-800">
                  {currentDoctor.workingHours.start} - {currentDoctor.workingHours.end}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Slot Duration:</span>
                <span className="font-semibold text-slate-800">
                  {currentDoctor.slotDurationMinutes} Minutes
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-slate-600">Working Days:</p>
              <div className="flex flex-wrap gap-1.5">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                  (day) => {
                    const isWorking = currentDoctor.workingDays.includes(day);
                    return (
                      <span
                        key={day}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                          isWorking
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-slate-100 text-slate-400 line-through"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </span>
                    );
                  },
                )}
              </div>
            </div>

            <Link
              to="/doctor-portal/schedule"
              className="mt-2 block text-center text-xs font-semibold text-[#1265b5] hover:underline"
            >
              Update Availability & Timings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
