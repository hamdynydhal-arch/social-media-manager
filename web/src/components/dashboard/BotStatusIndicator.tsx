"use client";

import { cn, formatRelativeTime, riskLevelConfig } from "@/lib/utils";
import type { WorkerStatus, RiskLevel } from "@prisma/client";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";

interface BotStatusIndicatorProps {
  isLaunched: boolean;
  workerStatus: WorkerStatus;
  lastHeartbeat: string | null;
  lastError: string | null;
  riskLevel: RiskLevel;
  isLiveMode: boolean;
}

const statusConfig = {
  RUNNING: { label: "يعمل", color: "green", icon: CheckCircle2, pulse: true },
  STARTING: { label: "يبدأ...", color: "yellow", icon: Clock, pulse: true },
  STOPPING: { label: "يتوقف...", color: "yellow", icon: Clock, pulse: false },
  STOPPED: { label: "متوقف", color: "gray", icon: XCircle, pulse: false },
  ERROR: { label: "خطأ", color: "red", icon: AlertTriangle, pulse: false },
};

export function BotStatusIndicator({
  isLaunched,
  workerStatus,
  lastHeartbeat,
  lastError,
  riskLevel,
  isLiveMode,
}: BotStatusIndicatorProps) {
  const status = statusConfig[workerStatus] ?? statusConfig.STOPPED;
  const risk = riskLevelConfig[riskLevel];

  const dotColors = {
    green: "bg-green-400",
    yellow: "bg-yellow-400",
    red: "bg-red-400",
    gray: "bg-muted-foreground",
  };

  return (
    <div
      className={cn(
        "border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4",
        isLaunched ? "bot-active-ring bg-green-950/20 border-green-900/30" : "bg-card border-border"
      )}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              dotColors[status.color as keyof typeof dotColors]
            )}
          />
          {status.pulse && (
            <div
              className={cn(
                "absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-75",
                dotColors[status.color as keyof typeof dotColors]
              )}
            />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              حالة البوت:{" "}
              <span
                className={
                  status.color === "green"
                    ? "text-green-400"
                    : status.color === "red"
                    ? "text-red-400"
                    : status.color === "yellow"
                    ? "text-yellow-400"
                    : "text-muted-foreground"
                }
              >
                {status.label}
              </span>
            </span>
            {isLiveMode && (
              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
                LIVE
              </span>
            )}
            {!isLiveMode && isLaunched && (
              <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                PAPER
              </span>
            )}
          </div>
          {lastHeartbeat && (
            <p className="text-xs text-muted-foreground mt-0.5">
              آخر نشاط: {formatRelativeTime(lastHeartbeat)}
            </p>
          )}
        </div>
      </div>

      {/* Risk level */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">مستوى المخاطرة:</span>
        <span className="font-medium">
          {risk.emoji} {risk.label}
        </span>
      </div>

      {/* Error */}
      {lastError && workerStatus === "ERROR" && (
        <div className="w-full flex items-start gap-2 bg-red-950/30 border border-red-900/30 rounded-lg p-3 text-sm text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-mono text-xs break-all">{lastError}</span>
        </div>
      )}
    </div>
  );
}
