
import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  CalendarPlus,
  Clock3,
  Search,
  Video,
  Stethoscope,
  X,
  AlertCircle,
  FileText,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useHospital } from "../../../context/HospitalContext";
import StatusBadge from "../../../components/ui/StatusBadge";
import type { Appointment, ConsultationType } from "../../../types";

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T12:00:00+05:30`));
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

export default function AppointmentsPage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED">("ALL");
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [consultationFilter, setConsultationFilter] = useState<"ALL" | ConsultationType>("ALL");

  // Modals state
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("11:00");
  const [detailTarget, setDetailTarget] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  const {
    currentPatient,
    appointments,
    doctors,
    cancelAppointment,
    rescheduleAppointment,
    startVideoCall,
  } = useHospital();

  const patientAppointments = useMemo(
    () => appointments.filter((a) => a.patientId === currentPatient.id),
    [appointments, currentPatient.id],
  );

  const upcomingAppointments = useMemo(
    () =>
      patientAppointments.filter((a) =>
        ["BOOKED", "CONFIRMED"].includes(a.status),
      ),
    [patientAppointments],
  );

  const completedAppointments = useMemo(
    () => patientAppointments.filter((a) => a.status === "COMPLETED"),
    [patientAppointments],
  );

  const cancelledAppointments = useMemo(
    () => patientAppointments.filter((a) => a.status === "CANCELLED"),
    [patientAppointments],
  );

  // Filtered list
  const filteredAppointments = useMemo(() => {
    return patientAppointments.filter((item) => {
      // Tab filter
      if (activeTab === "UPCOMING" && !["BOOKED", "CONFIRMED"].includes(item.status)) {
        return false;
      }
      if (activeTab === "COMPLETED" && item.status !== "COMPLETED") {
        return false;
      }
      if (activeTab === "CANCELLED" && item.status !== "CANCELLED") {
        return false;
      }

      // Consultation Type filter
      if (consultationFilter !== "ALL" && item.consultationType !== consultationFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const doc = doctors.find((d) => d.id === item.doctorId);
        const q = searchQuery.toLowerCase();
        const matchesReason = item.reason.toLowerCase().includes(q);
        const matchesDoctor = doc?.name.toLowerCase().includes(q);
        const matchesSpec = doc?.specialization.toLowerCase().includes(q);
        return matchesReason || matchesDoctor || matchesSpec;
      }

      return true;
    });
  }, [patientAppointments, activeTab, consultationFilter, searchQuery, doctors]);

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;

    // Calculate end time (+30 mins)
    const [h, m] = rescheduleTime.split(":").map(Number);
    const endMinutes = (m + 30) % 60;
    const endHours = h + Math.floor((m + 30) / 60);
    const endTimeStr = `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;

    rescheduleAppointment(
      rescheduleTarget.id,
      rescheduleDate,
      rescheduleTime,
      endTimeStr,
    );
    setRescheduleTarget(null);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelAppointment(cancelTarget.id);
    setCancelTarget(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Consultation Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#152a43] sm:text-3xl">
            My Appointments
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            View upcoming schedule, join video calls, or manage past medical visits.
          </p>
        </div>

        <Link
          to="/patient/book"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1265b5] px-5 text-xs font-semibold text-white shadow-md shadow-blue-900/10 transition hover:bg-[#0e559b]"
        >
          <CalendarPlus size={16} />
          Book New Consultation
        </Link>
      </section>

      {/* Tabs & Controls */}
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "ALL"
                ? "bg-[#10243e] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Visits ({patientAppointments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("UPCOMING")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "UPCOMING"
                ? "bg-[#10243e] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "COMPLETED"
                ? "bg-[#10243e] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Completed ({completedAppointments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CANCELLED")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "CANCELLED"
                ? "bg-[#10243e] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Cancelled ({cancelledAppointments.length})
          </button>
        </div>

        {/* Search & Mode Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Filter visits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 text-xs">
            <button
              type="button"
              onClick={() => setConsultationFilter("ALL")}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition ${
                consultationFilter === "ALL"
                  ? "bg-slate-100 text-slate-800 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Modes
            </button>
            <button
              type="button"
              onClick={() => setConsultationFilter("IN_PERSON")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium transition ${
                consultationFilter === "IN_PERSON"
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Stethoscope size={13} />
              In-Person
            </button>
            <button
              type="button"
              onClick={() => setConsultationFilter("ONLINE")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium transition ${
                consultationFilter === "ONLINE"
                  ? "bg-teal-50 text-teal-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Video size={13} />
              Online
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Cards Grid */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const doc = doctors.find((d) => d.id === appointment.doctorId);
            const isUpcoming = ["BOOKED", "CONFIRMED"].includes(appointment.status);
            const isOnline = appointment.consultationType === "ONLINE";

            return (
              <div
                key={appointment.id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  {/* Left: Doctor Profile & Reason */}
                  <div className="flex items-start gap-4">
                    {doc?.image ? (
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#edf5fc] text-base font-bold text-[#205681]">
                        {getInitials(doc?.name ?? "Doctor")}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#162942]">
                          {doc?.name ?? "Specialist Physician"}
                        </h3>
                        <StatusBadge status={appointment.status} />
                      </div>

                      <p className="mt-0.5 text-xs text-teal-700 font-medium">
                        {doc?.specialization} · {doc?.qualification}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                        <span className="font-semibold text-slate-500">Reason:</span>
                        <span className="truncate font-medium">{appointment.reason}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Date, Time & Mode */}
                  <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <CalendarDays size={15} className="text-teal-600" />
                        <span>{formatDate(appointment.appointmentDate)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 size={14} className="text-slate-400" />
                        <span>
                          {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          isOnline
                            ? "bg-teal-50 text-teal-700 ring-1 ring-teal-600/20"
                            : "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                        }`}
                      >
                        {isOnline ? <Video size={13} /> : <Stethoscope size={13} />}
                        {isOnline ? "Video Call" : "In-Person Visit"}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-400 text-center">
                        Fee: ₹{doc?.consultationFee ?? 600}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                    {/* If Online & Upcoming: Join Video Call */}
                    {isOnline && isUpcoming && (
                      <button
                        type="button"
                        onClick={() => startVideoCall(appointment)}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-teal-500 px-3.5 text-xs font-semibold text-slate-950 transition hover:bg-teal-400"
                      >
                        <Video size={14} />
                        Join Video
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDetailTarget(appointment)}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <FileText size={14} className="text-slate-500" />
                      Details
                    </button>

                    {isUpcoming && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleTarget(appointment);
                            setRescheduleDate(appointment.appointmentDate);
                            setRescheduleTime(appointment.startTime);
                          }}
                          className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <RefreshCw size={13} className="text-slate-500" />
                          Reschedule
                        </button>

                        <button
                          type="button"
                          onClick={() => setCancelTarget(appointment)}
                          className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1768b4]">
            <CalendarDays size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            No consultations found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No appointments matching "${searchQuery}". Try adjusting your filters.`
              : "You have no appointments in this category right now."}
          </p>
          <Link
            to="/patient/book"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            <CalendarPlus size={15} />
            Schedule an Appointment
          </Link>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Reschedule Appointment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select New Date
                </label>
                <input
                  type="date"
                  required
                  min={new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(new Date())}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Time Slot
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10"
                >
                  <option value="09:30">09:30 AM – 10:00 AM</option>
                  <option value="10:00">10:00 AM – 10:30 AM</option>
                  <option value="11:00">11:00 AM – 11:30 AM</option>
                  <option value="11:30">11:30 AM – 12:00 PM</option>
                  <option value="14:00">02:00 PM – 02:30 PM</option>
                  <option value="15:00">03:00 PM – 03:30 PM</option>
                  <option value="16:00">04:00 PM – 04:30 PM</option>
                </select>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-[11px] text-blue-800">
                Rescheduling is instant. Your doctor will be notified automatically.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Keep Existing
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  Confirm New Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Cancel Consultation?
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Are you sure you want to cancel your appointment with{" "}
              <strong className="text-slate-800">
                {doctors.find((d) => d.id === cancelTarget.doctorId)?.name ?? "Doctor"}
              </strong>{" "}
              on {formatDate(cancelTarget.appointmentDate)}?
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs"
              >
                Yes, Cancel Visit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-600">
                  Appointment Details
                </p>
                <h3 className="text-base font-bold text-slate-900">
                  Booking Receipt #{detailTarget.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailTarget(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 text-sm">
                    {doctors.find((d) => d.id === detailTarget.doctorId)?.name}
                  </span>
                  <StatusBadge status={detailTarget.status} />
                </div>
                <p className="text-slate-500">
                  {doctors.find((d) => d.id === detailTarget.doctorId)?.specialization} ·{" "}
                  {doctors.find((d) => d.id === detailTarget.doctorId)?.qualification}
                </p>
                <div className="mt-3 flex items-center gap-4 text-slate-600">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} className="text-teal-600" />
                    {formatDate(detailTarget.appointmentDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={13} className="text-teal-600" />
                    {formatTime(detailTarget.startTime)} – {formatTime(detailTarget.endTime)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Consultation Type
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {detailTarget.consultationType === "ONLINE"
                      ? "Online Video Call"
                      : "In-Person Clinic Visit"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Consultation Fee
                  </span>
                  <p className="font-bold text-emerald-700 mt-0.5">
                    ₹{doctors.find((d) => d.id === detailTarget.doctorId)?.consultationFee ?? 600} (Paid)
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Chief Complaint / Reason
                </span>
                <p className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-800">
                  {detailTarget.reason}
                </p>
              </div>

              <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-[11px] text-teal-900 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Please present your Medicare Patient ID #{currentPatient.id} upon arrival at
                  reception or join the video call 5 minutes before scheduled start time.
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDetailTarget(null)}
                className="rounded-xl bg-[#10243e] px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
