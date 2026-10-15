
import { useState, useEffect } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { Appointment, Doctor } from "../../types";

interface TelemedicineModalProps {
  appointment: Appointment;
  doctor: Doctor | undefined;
  patientName: string;
  onClose: () => void;
}

export default function TelemedicineModal({
  appointment,
  doctor,
  patientName,
  onClose,
}: TelemedicineModalProps) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [seconds, setSeconds] = useState(42);
  const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat");
  const [chatMessages, setChatMessages] = useState<
    { sender: "doctor" | "patient"; text: string; time: string }[]
  >([
    {
      sender: "doctor",
      text: `Hello ${patientName.split(" ")[0]}, I am reviewing your consultation notes for "${appointment.reason}". How have you been feeling since yesterday?`,
      time: "10:02 AM",
    },
    {
      sender: "patient",
      text: "Hello Doctor, I've had mild headaches in the morning and wanted to get my routine metrics checked.",
      time: "10:03 AM",
    },
    {
      sender: "doctor",
      text: "Understood. Your blood pressure readings are within the normal range. Let's do a quick visual checkup.",
      time: "10:04 AM",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCallDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      sender: "patient" as const,
      text: inputMessage,
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate doctor reply after 1.5s
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "doctor",
          text: "Noted. I will record this in your clinical summary and update your prescription instructions.",
          time: new Date().toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-5 backdrop-blur-sm">
      <div className="flex h-[92vh] max-h-[850px] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-[#0f172a] text-white shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#162032] px-6 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Telehealth Consultation Room
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  HD Encrypted
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {doctor?.name ?? "Doctor"} · {doctor?.specialization} · Appointment #{appointment.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-800/90 px-3 py-1 text-xs font-mono font-medium text-slate-200">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              {formatCallDuration(seconds)}
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Minimize
            </button>
          </div>
        </div>

        {/* Video Call Body & Right Side Chat */}
        <div className="grid flex-1 overflow-hidden lg:grid-cols-[1fr_360px]">
          {/* Main Video Area */}
          <div className="relative flex flex-col justify-between bg-[#0a0f1d] p-4 sm:p-6">
            {/* Top Video Overlay */}
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-black/40 px-3 py-1.5 backdrop-blur-md">
                <p className="text-xs font-semibold text-white">
                  {doctor?.name ?? "Dr. Amit Sharma"}
                </p>
                <p className="text-[10px] text-emerald-400">Audio & Video Active</p>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-md">
                <ShieldCheck size={14} className="text-teal-400" />
                HIPAA Compliant Video
              </div>
            </div>

            {/* Doctor Simulated Video Feed */}
            <div className="my-auto flex flex-col items-center justify-center py-8">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-teal-500/20 to-blue-500/20 blur-xl animate-pulse" />
                {doctor?.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="relative h-44 w-44 rounded-full border-4 border-teal-500/30 object-cover shadow-2xl"
                  />
                ) : (
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-teal-500/30 bg-teal-800 text-5xl font-bold shadow-2xl">
                    {doctor?.name?.[0] ?? "D"}
                  </div>
                )}
                <span className="absolute bottom-2 right-2 rounded-full bg-emerald-500 p-2 ring-4 ring-[#0a0f1d]">
                  <Mic size={16} />
                </span>
              </div>
              <p className="mt-4 text-base font-semibold text-white">
                Speaking with {doctor?.name}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Reason: {appointment.reason}
              </p>
            </div>

            {/* Bottom Controls & Self-View Floating */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              {/* Patient Self-View PIP */}
              <div className="relative h-28 w-44 overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-xl">
                {videoEnabled ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-slate-800 text-slate-300">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/30 font-bold text-blue-300 text-sm">
                      {patientName.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="mt-1 text-[10px] text-slate-400">
                      You ({patientName.split(" ")[0]})
                    </span>
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-950 text-slate-500 text-xs">
                    Camera Off
                  </div>
                )}
                <div className="absolute bottom-1.5 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                  You
                </div>
              </div>

              {/* Call Control Buttons */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-900/90 p-2.5 backdrop-blur-md border border-white/10">
                <button
                  type="button"
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                    micEnabled
                      ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      : "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40"
                  }`}
                  title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button
                  type="button"
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                    videoEnabled
                      ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      : "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40"
                  }`}
                  title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                <div className="h-6 w-px bg-white/10" />

                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-900/30 transition hover:bg-rose-700"
                >
                  <PhoneOff size={17} />
                  End Call
                </button>
              </div>

              {/* Placeholder to balance layout */}
              <div className="hidden sm:block sm:w-44" />
            </div>
          </div>

          {/* Right Panel: Chat & Medical Notes */}
          <div className="flex flex-col border-t border-slate-800 bg-[#111927] lg:border-l lg:border-t-0">
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold transition ${
                  activeTab === "chat"
                    ? "border-b-2 border-teal-400 text-white bg-slate-800/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare size={15} />
                Live Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold transition ${
                  activeTab === "notes"
                    ? "border-b-2 border-teal-400 text-white bg-slate-800/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText size={15} />
                Doctor's Notes
              </button>
            </div>

            {/* Tab 1: Chat Messages */}
            {activeTab === "chat" && (
              <div className="flex flex-1 flex-col justify-between overflow-hidden p-4">
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.sender === "patient" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                          msg.sender === "patient"
                            ? "bg-teal-600 text-white"
                            : "bg-slate-800 text-slate-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="mt-1 text-[10px] text-slate-500">
                        {msg.sender === "doctor" ? doctor?.name?.split(" ")[0] ?? "Doctor" : "You"} · {msg.time}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type message to doctor..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                  <button
                    type="submit"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-slate-950 transition hover:bg-teal-400"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Doctor Notes / E-Prescription Preview */}
            {activeTab === "notes" && (
              <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-teal-300 font-semibold mb-2">
                    <Sparkles size={16} />
                    Live Clinical Assessment
                  </div>
                  <p className="text-[11px] leading-5 text-slate-400">
                    Patient presents for routine follow-up. Vital metrics evaluated: BP 118/78, Pulse 72 bpm. Mild tension symptoms discussed.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <h4 className="font-semibold text-white mb-2">Prescription Directives</h4>
                  <ul className="space-y-2 text-[11px] text-slate-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-400 shrink-0 mt-0.5" />
                      <span>Continue current maintenance medication as prescribed.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-400 shrink-0 mt-0.5" />
                      <span>Maintain hydration (2.5L daily) and monitor sleep schedule.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-400 shrink-0 mt-0.5" />
                      <span>Schedule follow-up review in 4 weeks if headaches persist.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
