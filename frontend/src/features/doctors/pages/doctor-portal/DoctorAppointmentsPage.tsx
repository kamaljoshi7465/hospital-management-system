import { useState, useMemo } from "react";
import {
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Video,
  Clock,
  Phone,
  User,
  Filter,
} from "lucide-react";
import StatusBadge from "../../../../components/ui/StatusBadge";
import { useHospital } from "../../../../context/HospitalContext";
import type { AppointmentStatus } from "../../../../types/appointment.types";

export default function DoctorAppointmentsPage() {
  const {
    currentDoctor,
    appointments,
    patients,
    updateAppointmentStatus,
    startVideoCall,
  } = useHospital();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "UPCOMING">("ALL");

  const todayStr = new Date().toISOString().split("T")[0];

  const doctorAppointments = useMemo(() => {
    return appointments.filter((a) => a.doctorId === currentDoctor.id);
  }, [appointments, currentDoctor.id]);

  const filtered = useMemo(() => {
    return doctorAppointments.filter((apt) => {
      const patient = patients.find((p) => p.id === apt.patientId);
      const patientName = patient?.fullName.toLowerCase() || "";
      const reason = apt.reason.toLowerCase();
      const query = search.toLowerCase();

      const matchesSearch =
        patientName.includes(query) ||
        reason.includes(query) ||
        apt.appointmentDate.includes(query);

      const matchesStatus =
        statusFilter === "ALL" || apt.status === statusFilter;

      let matchesDate = true;
      if (dateFilter === "TODAY") {
        matchesDate = apt.appointmentDate === todayStr;
      } else if (dateFilter === "UPCOMING") {
        matchesDate =
          apt.appointmentDate >= todayStr &&
          ["BOOKED", "CONFIRMED"].includes(apt.status);
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [doctorAppointments, patients, search, statusFilter, dateFilter, todayStr]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Patient Appointments & OPD Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your patient consultations, attend video calls, and record visit outcomes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDateFilter("ALL");
              setStatusFilter("ALL");
              setSearch("");
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-2xs"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search patient name, reason, or date (YYYY-MM-DD)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
          />
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 shrink-0">
          {(["ALL", "TODAY", "UPCOMING"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setDateFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                dateFilter === tab
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "ALL"
                ? "All Dates"
                : tab === "TODAY"
                ? "Today's OPD"
                : "Upcoming"}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-teal-500 transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="BOOKED">Booked</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointment Cards / Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((apt) => {
              const patient = patients.find((p) => p.id === apt.patientId);
              const isTelehealth = apt.consultationType === "ONLINE";
              const isToday = apt.appointmentDate === todayStr;

              // Calculate age from dateOfBirth if available
              const patientAge = patient?.dateOfBirth
                ? new Date().getFullYear() -
                  new Date(patient.dateOfBirth).getFullYear()
                : null;

              return (
                <div
                  key={apt.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                >
                  {/* Left: Patient Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-sm font-bold text-teal-800 border border-teal-100">
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
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {patient?.fullName ?? `Patient #${apt.patientId}`}
                        </span>
                        <StatusBadge status={apt.status} />
                        {isToday && (
                          <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200">
                            TODAY
                          </span>
                        )}
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {apt.consultationType}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">
                        Chief Complaint: {apt.reason}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <CalendarDays size={13} className="text-teal-600" />
                          {apt.appointmentDate}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Clock size={13} className="text-teal-600" />
                          {apt.startTime} - {apt.endTime}
                        </span>
                        {patient && (
                          <>
                            <span className="flex items-center gap-1 text-slate-500">
                              <User size={13} />
                              {patientAge ? `${patientAge}y · ` : ""}
                              {patient.gender} · Blood {patient.bloodGroup}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Phone size={13} />
                              +91 {patient.phone}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Telemedicine Video Call */}
                    {isTelehealth && apt.status !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => startVideoCall(apt)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
                      >
                        <Video size={14} />
                        Join Telehealth
                      </button>
                    )}

                    {/* Mark Complete */}
                    {apt.status !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateAppointmentStatus(apt.id, "COMPLETED" as AppointmentStatus)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                      >
                        <CheckCircle2 size={14} />
                        Mark Done
                      </button>
                    )}

                    {/* Status dropdown to change to other states */}
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        updateAppointmentStatus(
                          apt.id,
                          e.target.value as AppointmentStatus,
                        )
                      }
                      className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-teal-500 transition"
                    >
                      <option value="BOOKED">Booked</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>

                    {["BOOKED", "CONFIRMED"].includes(apt.status) && (
                      <button
                        type="button"
                        onClick={() =>
                          updateAppointmentStatus(apt.id, "CANCELLED" as AppointmentStatus)
                        }
                        title="Cancel appointment"
                        className="p-2 text-slate-400 hover:text-rose-600 transition rounded-xl hover:bg-rose-50"
                      >
                        <XCircle size={17} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No matching appointments found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your search criteria or date/status filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
