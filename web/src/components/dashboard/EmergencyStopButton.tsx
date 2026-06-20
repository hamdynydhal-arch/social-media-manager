"use client";

import { useState } from "react";
import { AlertTriangle, OctagonX } from "lucide-react";

interface EmergencyStopButtonProps {
  onStop: () => void;
  loading: boolean;
}

export function EmergencyStopButton({ onStop, loading }: EmergencyStopButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2 bg-red-950/50 border border-red-900/50 rounded-xl px-4 py-2.5">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="text-red-300 text-sm font-medium">تأكيد الإيقاف؟</span>
        <button
          onClick={() => { setConfirming(false); onStop(); }}
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg transition-all"
        >
          نعم، أوقف
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-muted-foreground hover:text-foreground text-sm px-2 py-1 transition-colors"
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      disabled={loading}
      className="flex items-center gap-2 bg-red-950/60 hover:bg-red-900/60 border border-red-900/50 text-red-400 hover:text-red-300 font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
    >
      <OctagonX className="w-4 h-4" />
      إيقاف فوري
    </button>
  );
}
