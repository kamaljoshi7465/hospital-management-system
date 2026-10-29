
import { useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Stethoscope,
  Video,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Check,
} from "lucide-react";
import { useHospital } from "../../../context/HospitalContext";
import type { ConsultationType } from "../../../types";
import { useScheduleQuery } from "../../../hooks/useHospitalApi";

function getDatesForNextDays(daysCount = 14) {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const dateString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

    const dayName = new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      timeZone: "Asia/Kolkata",
    }).format(d);

    const monthName = new Intl.DateTimeFormat("en-IN", {
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(d);

    const dayNumber = d.getDate();

    dates.push({
      dateString,
      dayName,
      monthName,
      dayNumber,
      isToday: i === 0,
      isTomorrow: i === 1,
      isWeekend: d.getDay() === 0,
    });
  }

  return dates;
}

function slotsBetween(start: string, end: string, duration: number, breaks: { startTime: string; endTime: string }[] = []) {
  const toMinutes = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
  const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const slots: { start: string; end: string; period: string }[] = [];
  for (let cursor = toMinutes(start); cursor + duration <= toMinutes(end); cursor += duration) {
    const finish = cursor + duration;
    if (breaks.some(b => cursor < toMinutes(b.endTime) && finish > toMinutes(b.startTime))) continue;
    slots.push({ start: toTime(cursor), end: toTime(finish), period: cursor < 12 * 60 ? "Morning" : cursor < 16 * 60 ? "Afternoon" : "Evening" });
  }
  return slots;
}

export default function BookingPage() {
  const { doctorId } = useParams<{ doctorId?: string }>();
  const navigate = useNavigate();
  const { doctors, appointments, currentPatient, bookAppointment } = useHospital();

  const availableDates = useMemo(() => getDatesForNextDays(14), []);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(() => {
    if (doctorId && !isNaN(Number(doctorId))) {
      return Number(doctorId);
    }
    return doctors[0]?.id ?? 1;
  });
  const { data: schedule = [] } = useScheduleQuery(selectedDoctorId);

  const [doctorFilter, setDoctorFilter] = useState<string>("ALL");
  const [slotPeriodFilter, setSlotPeriodFilter] = useState<"ALL" | "Morning" | "Afternoon" | "Evening">("ALL");

  const [consultationType, setConsultationType] =
    useState<ConsultationType>("IN_PERSON");
  const [selectedDate, setSelectedDate] = useState<string>(
    availableDates[0]?.dateString ?? "",
  );
  const [selectedSlotState, setSelectedSlot] = useState<{
    start: string;
    end: string;
    period: string;
  }>({ start: "", end: "", period: "Morning" });
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointmentId, setConfirmedAppointmentId] = useState<number | null>(null);

  const selectedDoctor =
    doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const dateDay = new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const dailySchedule = schedule.find(day => day.dayOfWeek.toUpperCase() === dateDay);
  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDoctor.available || !(selectedDoctor.workingDays ?? []).map(d => d.toUpperCase()).includes(dateDay)) return [];
    let breaks: { startTime: string; endTime: string }[] = [];
    try { breaks = dailySchedule?.breaksJson ? JSON.parse(dailySchedule.breaksJson) : []; } catch { /* malformed schedule has no usable break data */ }
    return slotsBetween(dailySchedule?.startTime ?? selectedDoctor.workingHours.start, dailySchedule?.endTime ?? selectedDoctor.workingHours.end, selectedDoctor.slotDurationMinutes || 30, breaks);
  }, [selectedDoctor, dateDay, dailySchedule]);
  const selectedSlot = availableSlots.find(slot => slot.start === selectedSlotState.start) ?? availableSlots[0] ?? { start: "", end: "", period: "" };

  // Specialty options for filtering doctors
  const specialties = useMemo(() => {
    const list = Array.from(new Set(doctors.map((d) => d.specialization)));
    return ["ALL", ...list];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (doctorFilter === "ALL") return doctors;
    return doctors.filter((d) => d.specialization === doctorFilter);
  }, [doctors, doctorFilter]);

  // Booked slots conflict calculator
  const bookedSlotsOnDate = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          a.doctorId === selectedDoctorId &&
          a.appointmentDate === selectedDate &&
          ["BOOKED", "CONFIRMED"].includes(a.status),
      )
      .map((a) => a.startTime);
  }, [appointments, selectedDoctorId, selectedDate]);

  // Filtered slots by period
  const displaySlots = useMemo(() => {
    if (slotPeriodFilter === "ALL") return availableSlots;
    return availableSlots.filter((s) => s.period === slotPeriodFilter);
  }, [slotPeriodFilter, availableSlots]);

  const scrollDates = (direction: "left" | "right") => {
    if (dateScrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      dateScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot.start) return;

    setIsSubmitting(true);

    const newApt = await bookAppointment({
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        reason: reason.trim() || "General Consultation & Checkup",
        consultationType,
      });
    setIsSubmitting(false);
    if (newApt) setConfirmedAppointmentId(newApt.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 pb-28 lg:pb-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/patient/appointments"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={14} />
            Back to appointments
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#152a43] sm:text-3xl">
            Book an Appointment
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Select your medical specialist, choose an in-person or video visit, and reserve a convenient slot.
          </p>
        </div>

        {/* Selected preview chip on tablets/desktop */}
        <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
          <img
            src={selectedDoctor.image}
            alt={selectedDoctor.name}
            className="h-10 w-10 rounded-xl object-cover shrink-0"
          />
          <div className="text-left pr-2">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {selectedDoctor.name}
            </p>
            <p className="text-[11px] text-teal-700 font-medium">
              ₹{selectedDoctor.consultationFee} · {selectedDoctor.specialization}
            </p>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid items-start gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Form Column */}
        <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-6">
          {/* Step 1: Select Specialist Doctor */}
          <section className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col gap-3 pb-3.5 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                  1
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Choose Specialist Doctor
                </h2>
              </div>

              {/* Specialty filter buttons for quick mobile/tablet filtering */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {specialties.slice(0, 4).map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setDoctorFilter(spec)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition shrink-0 ${
                      doctorFilter === spec
                        ? "bg-[#10243e] text-white font-semibold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {spec === "ALL" ? "All Specialists" : spec.replace("Surgeon", "")}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors Grid: 1 col on mobile, 2 col on tablet/desktop, 3 col on large desktop */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDoctors.map((doc) => {
                const isSelected = doc.id === selectedDoctorId;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`relative flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="h-12 w-12 sm:h-13 sm:w-13 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-white shadow-xs">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {doc.name}
                      </p>
                      <p className="truncate text-[11px] font-medium text-teal-700">
                        {doc.specialization}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{doc.experienceYears}y exp</span>
                        <span className="font-bold text-slate-800">₹{doc.consultationFee}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Select Consultation Mode */}
          <section className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs">
            <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                2
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Select Care Mode
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setConsultationType("IN_PERSON")}
                className={`flex items-start gap-3.5 rounded-2xl border p-3.5 sm:p-4 text-left transition ${
                  consultationType === "IN_PERSON"
                    ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Stethoscope size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      In-Person OPD Visit
                    </p>
                    {consultationType === "IN_PERSON" && (
                      <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    Clinic visit at MediCare Hospital campus with physical vitals check.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConsultationType("ONLINE")}
                className={`flex items-start gap-3.5 rounded-2xl border p-3.5 sm:p-4 text-left transition ${
                  consultationType === "ONLINE"
                    ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <Video size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Online Video Call
                    </p>
                    {consultationType === "ONLINE" && (
                      <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    Encrypted HD virtual consultation room from your phone or browser.
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* Step 3: Date Picker with Scroll Buttons */}
          <section className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                  3
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Select Consultation Date
                </h2>
              </div>

              {/* Scroll Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollDates("left")}
                  aria-label="Scroll dates left"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollDates("right")}
                  aria-label="Scroll dates right"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Scrollable Date Track */}
            <div
              ref={dateScrollRef}
              className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth -mx-1 px-1"
            >
              {availableDates.map((item) => {
                const isSelected = item.dateString === selectedDate;
                return (
                  <button
                    key={item.dateString}
                    type="button"
                    onClick={() => setSelectedDate(item.dateString)}
                    className={`flex flex-col items-center justify-center min-w-[68px] sm:min-w-[76px] rounded-2xl border px-2.5 py-3 transition shrink-0 ${
                      isSelected
                        ? "border-[#10243e] bg-[#10243e] text-white shadow-md scale-102"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
                      {item.isToday ? "Today" : item.isTomorrow ? "Tmrw" : item.dayName}
                    </span>
                    <span className="text-base sm:text-lg font-bold my-0.5">
                      {item.dayNumber}
                    </span>
                    <span className="text-[10px] opacity-75">
                      {item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 4: Time Slot Picker with Period Filter */}
          <section className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs">
            <div className="mb-4 flex flex-col gap-3 pb-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                  4
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Select Time Slot
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    30-min individual slot duration
                  </p>
                </div>
              </div>

              {/* Day Period Segmented Tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSlotPeriodFilter("ALL")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${
                    slotPeriodFilter === "ALL"
                      ? "bg-white text-slate-900 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSlotPeriodFilter("Morning")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition ${
                    slotPeriodFilter === "Morning"
                      ? "bg-white text-amber-700 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sun size={12} />
                  Morning
                </button>
                <button
                  type="button"
                  onClick={() => setSlotPeriodFilter("Afternoon")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition ${
                    slotPeriodFilter === "Afternoon"
                      ? "bg-white text-sky-700 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sunset size={12} />
                  Afternoon
                </button>
                <button
                  type="button"
                  onClick={() => setSlotPeriodFilter("Evening")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition ${
                    slotPeriodFilter === "Evening"
                      ? "bg-white text-indigo-700 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Moon size={12} />
                  Evening
                </button>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {displaySlots.map((slot) => {
                const isBooked = bookedSlotsOnDate.includes(slot.start);
                const isSelected = selectedSlot.start === slot.start;

                return (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs transition ${
                      isBooked
                        ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through"
                        : isSelected
                        ? "border-teal-500 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/25 shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-medium">
                      {slot.start} – {slot.end}
                    </span>
                    <span className="mt-0.5 text-[10px] text-slate-400">
                      {isBooked ? "Booked" : slot.period}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 5: Clinical Reason & Symptoms */}
          <section className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs">
            <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                5
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Reason & Health Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Chief Complaint / Reason for Consultation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regular health checkup, mild headache follow-up, ECG review..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Additional Notes or Symptoms (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your symptoms, previous treatments, or ongoing prescriptions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/10"
                />
              </div>
            </div>
          </section>

          {/* Desktop/Tablet Submit Action (Hidden on mobile where the sticky bar is present) */}
          <div className="hidden lg:flex items-center justify-end gap-3 pt-2">
            <Link
              to="/patient/appointments"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1265b5] px-7 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#0e559b] hover:shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <span>Confirm Appointment</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Rail: Desktop/Tablet Sticky Summary */}
        <aside className="hidden lg:block sticky top-24 space-y-5">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Booking Summary</span>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                Step by step
              </span>
            </h3>

            {/* Doctor Info */}
            <div className="mt-4 flex items-center gap-3">
              <img
                src={selectedDoctor.image}
                alt={selectedDoctor.name}
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-blue-100 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {selectedDoctor.name}
                </p>
                <p className="text-xs text-teal-700 font-medium truncate">
                  {selectedDoctor.specialization}
                </p>
                <p className="text-[10px] text-slate-400">
                  {selectedDoctor.qualification}
                </p>
              </div>
            </div>

            {/* Date, Slot & Patient */}
            <div className="mt-5 space-y-2.5 rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Date</span>
                <span className="font-semibold text-slate-800">{selectedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Time Slot</span>
                <span className="font-semibold text-slate-800">
                  {selectedSlot.start} – {selectedSlot.end} ({selectedSlot.period})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mode</span>
                <span className="font-semibold text-teal-700">
                  {consultationType === "ONLINE" ? "Online Video Call" : "In-Person Clinic Visit"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Patient</span>
                <span className="font-semibold text-slate-800">
                  {currentPatient.fullName}
                </span>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Doctor Consultation Fee</span>
                <span className="font-medium text-slate-900">
                  ₹{selectedDoctor.consultationFee}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Hospital Facility & Booking Fee</span>
                <span className="font-medium text-emerald-600">FREE (₹0)</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-2 text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-teal-700">₹{selectedDoctor.consultationFee}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-[11px] text-teal-800">
              <ShieldCheck size={16} className="text-teal-600 shrink-0" />
              <span>Instant slot confirmation with official booking receipt.</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile / Small Screen Fixed Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-2xl">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <span className="truncate">{selectedDoctor.name.split(" ")[0]} {selectedDoctor.name.split(" ")[1]}</span>
              <span className="text-teal-700">₹{selectedDoctor.consultationFee}</span>
            </div>
            <p className="truncate text-[10px] text-slate-500">
              {selectedDate} · {selectedSlot.start} · {consultationType === "ONLINE" ? "Video" : "Clinic"}
            </p>
          </div>

          <button
            type="submit"
            form="booking-form"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1265b5] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-900/15 transition hover:bg-[#0e559b] disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? (
              <span>Booking...</span>
            ) : (
              <>
                <span>Confirm</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Booking Success Modal (Fully Responsive with max-h and scroll) */}
      {confirmedAppointmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3.5 sm:p-5 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-6 sm:ring-8 ring-emerald-500/10 mb-4">
              <CheckCircle2 size={32} />
            </div>

            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-800">
              Appointment Confirmed
            </span>

            <h3 className="mt-2.5 text-lg sm:text-xl font-bold text-slate-900">
              Booking Receipt #{confirmedAppointmentId}
            </h3>

            <div className="mt-3 rounded-2xl bg-slate-50 p-3.5 text-left text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor:</span>
                <span className="font-semibold text-slate-800">{selectedDoctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Specialty:</span>
                <span className="text-teal-700 font-medium">{selectedDoctor.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Slot:</span>
                <span className="font-semibold text-slate-800">{selectedDate} at {selectedSlot.start}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mode:</span>
                <span className="font-medium text-slate-800">
                  {consultationType === "ONLINE" ? "Online Video Call" : "In-Person OPD Clinic"}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-700">₹{selectedDoctor.consultationFee}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate("/patient/appointments")}
                className="w-full rounded-xl bg-[#10243e] py-2.5 sm:py-3 text-xs font-semibold text-white transition hover:bg-slate-800 shadow-xs"
              >
                View in My Appointments
              </button>
              <button
                type="button"
                onClick={() => navigate("/patient/dashboard")}
                className="w-full rounded-xl border border-slate-200 py-2 sm:py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Back to Patient Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
