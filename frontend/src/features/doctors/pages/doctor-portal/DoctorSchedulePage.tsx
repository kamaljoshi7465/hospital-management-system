import { useState } from "react";
import {
  Clock,
  Calendar,
  Save,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useHospital } from "../../../../context/HospitalContext";

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function DoctorSchedulePage() {
  const { currentDoctor, updateDoctor } = useHospital();

  const [available, setAvailable] = useState(currentDoctor.available);
  const [workingDays, setWorkingDays] = useState<string[]>(
    currentDoctor.workingDays || [],
  );
  const [workingHours, setWorkingHours] = useState({
    start: currentDoctor.workingHours.start || "09:00",
    end: currentDoctor.workingHours.end || "17:00",
  });
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(
    currentDoctor.slotDurationMinutes || 30,
  );

  const [saved, setSaved] = useState(false);

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDoctor(currentDoctor.id, {
      available,
      workingDays,
      workingHours,
      slotDurationMinutes: Number(slotDurationMinutes),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          OPD Working Hours & Weekly Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure clinical consulting days, hours, and appointment slot durations
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Availability Toggle */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Accepting New Appointments
            </h2>
            <p className="text-xs text-slate-500">
              When switched off, patients cannot book new OPD or video consultations with you
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAvailable(!available)}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold text-xs sm:text-sm transition ${
              available
                ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-xs"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {available ? (
              <>
                <ToggleRight size={22} className="text-teal-600" />
                <span>Available for Booking</span>
              </>
            ) : (
              <>
                <ToggleLeft size={22} className="text-rose-600" />
                <span>On Leave / Unavailable</span>
              </>
            )}
          </button>
        </div>

        {/* Weekly Consultation Days */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-teal-600" />
                Weekly OPD Days
              </h3>
              <p className="text-xs text-slate-500">
                Select the days of the week you attend OPD clinics
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {workingDays.length} Days Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
            {ALL_DAYS.map((day) => {
              const isSelected = workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
                    isSelected
                      ? "border-teal-500 bg-teal-50/50 text-teal-900 shadow-xs ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm font-bold">{day.slice(0, 3)}</span>
                  <span className="text-[10px] mt-0.5 text-slate-400">
                    {day}
                  </span>
                  <span
                    className={`mt-2 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                      isSelected
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isSelected ? "Active" : "Off"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Working Hours & Slot Duration */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-teal-600" />
              Daily Shift Timings & Slots
            </h3>
            <p className="text-xs text-slate-500">
              Specify your clinical start/end times and patient slot allocation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shift Start */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sun size={14} className="text-amber-500" />
                Shift Start Time
              </label>
              <input
                type="time"
                required
                value={workingHours.start}
                onChange={(e) =>
                  setWorkingHours({ ...workingHours, start: e.target.value })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
              />
            </div>

            {/* Shift End */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Moon size={14} className="text-indigo-500" />
                Shift End Time
              </label>
              <input
                type="time"
                required
                value={workingHours.end}
                onChange={(e) =>
                  setWorkingHours({ ...workingHours, end: e.target.value })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
              />
            </div>

            {/* Slot Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Slot Duration (Minutes)
              </label>
              <select
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes (Recommended)</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 flex items-start gap-3 text-xs text-blue-900">
            <AlertCircle size={16} className="text-[#1265b5] shrink-0 mt-0.5" />
            <p>
              Your schedule is automatically reflected in the patient booking page. Existing confirmed appointments will not be cancelled when you modify hours.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle size={15} /> Schedule saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1265b5] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#0e559b] transition"
            >
              <Save size={15} />
              Save Schedule Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
