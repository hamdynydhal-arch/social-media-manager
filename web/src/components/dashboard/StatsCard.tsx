import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  color?: "green" | "red" | "blue" | "purple" | "gray";
}

const colorMap = {
  green: "text-green-400 bg-green-500/10",
  red: "text-red-400 bg-red-500/10",
  blue: "text-blue-400 bg-blue-500/10",
  purple: "text-purple-400 bg-purple-500/10",
  gray: "text-muted-foreground bg-muted/30",
};

const valueColorMap = {
  green: "text-green-400",
  red: "text-red-400",
  blue: "text-foreground",
  purple: "text-foreground",
  gray: "text-foreground",
};

export function StatsCard({ icon: Icon, label, value, subValue, color = "gray" }: StatsCardProps) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", colorMap[color])}>
          <Icon className={cn("w-4 h-4", colorMap[color].split(" ")[0])} />
        </div>
      </div>
      <div>
        <div className={cn("text-2xl font-bold number-ltr", valueColorMap[color])}>{value}</div>
        {subValue && (
          <div className={cn("text-sm number-ltr", valueColorMap[color], "opacity-70 mt-0.5")}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
