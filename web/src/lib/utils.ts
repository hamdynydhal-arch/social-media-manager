import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatUSD(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPnl(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatUSD(value)}`;
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ar });
}

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar });
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const riskLevelConfig = {
  CONSERVATIVE: {
    label: "محافظ",
    color: "profit",
    emoji: "🟢",
    riskPct: 1,
    maxTrades: 2,
    description: "مخاطرة 1% لكل صفقة، صفقتان متزامنتان",
  },
  BALANCED: {
    label: "متوازن",
    color: "gold",
    emoji: "🟡",
    riskPct: 2,
    maxTrades: 3,
    description: "مخاطرة 2% لكل صفقة، 3 صفقات متزامنة",
  },
  AGGRESSIVE: {
    label: "جريء",
    color: "loss",
    emoji: "🔴",
    riskPct: 3,
    maxTrades: 3,
    description: "مخاطرة 3% لكل صفقة، 3 صفقات متزامنة",
  },
} as const;

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}
