"use client";

import { cn } from "@/lib/utils";
import { riskLevelConfig } from "@/lib/utils";
import type { RiskLevel } from "@prisma/client";

const levels: RiskLevel[] = ["CONSERVATIVE", "BALANCED", "AGGRESSIVE"];

interface RiskLevelSelectorProps {
  value: RiskLevel;
  onChange: (level: RiskLevel) => void;
}

export function RiskLevelSelector({ value, onChange }: RiskLevelSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {levels.map((level) => {
        const config = riskLevelConfig[level];
        const isSelected = value === level;

        const borderColor =
          level === "CONSERVATIVE"
            ? "border-green-500/50 bg-green-950/20"
            : level === "BALANCED"
            ? "border-yellow-500/50 bg-yellow-950/20"
            : "border-red-500/50 bg-red-950/20";

        const iconColor =
          level === "CONSERVATIVE"
            ? "text-green-400"
            : level === "BALANCED"
            ? "text-yellow-400"
            : "text-red-400";

        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              "relative flex flex-col gap-3 p-4 rounded-xl border-2 transition-all text-right",
              isSelected
                ? borderColor
                : "border-border hover:border-border/80 bg-transparent"
            )}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div
                className={cn(
                  "absolute top-3 left-3 w-2 h-2 rounded-full",
                  level === "CONSERVATIVE"
                    ? "bg-green-400"
                    : level === "BALANCED"
                    ? "bg-yellow-400"
                    : "bg-red-400"
                )}
              />
            )}

            <div className="text-2xl">{config.emoji}</div>
            <div>
              <div className={cn("font-bold text-base", isSelected ? iconColor : "text-foreground")}>
                {config.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {config.description}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span
                className={cn(
                  "px-2 py-0.5 rounded font-medium",
                  isSelected ? cn("bg-current/10", iconColor) : "bg-muted/30 text-muted-foreground"
                )}
              >
                {config.riskPct}% مخاطرة
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded font-medium",
                  isSelected ? cn("bg-current/10", iconColor) : "bg-muted/30 text-muted-foreground"
                )}
              >
                {config.maxTrades} صفقات
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
