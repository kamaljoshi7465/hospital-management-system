
import type { AppointmentStatus } from "../../types";

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const statusStyles: Record<AppointmentStatus, string> = {
  BOOKED: "bg-sky-50 text-sky-700 ring-sky-600/20",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-500/20",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/20",
  NO_SHOW: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
