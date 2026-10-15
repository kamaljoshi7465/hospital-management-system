
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import type { Toast } from "../../context/HospitalContext";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm flex-col gap-2.5">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = "border-emerald-500/30 bg-emerald-950/90 text-emerald-100";
        let iconColor = "text-emerald-400";

        if (toast.type === "error") {
          Icon = AlertCircle;
          borderClass = "border-rose-500/30 bg-rose-950/90 text-rose-100";
          iconColor = "text-rose-400";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          borderClass = "border-amber-500/30 bg-amber-950/90 text-amber-100";
          iconColor = "text-amber-400";
        } else if (toast.type === "info") {
          Icon = Info;
          borderClass = "border-sky-500/30 bg-slate-900/90 text-sky-100";
          iconColor = "text-sky-400";
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all ${borderClass}`}
          >
            <Icon size={20} className={`shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">{toast.title}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-300">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="text-slate-400 hover:text-white transition"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
