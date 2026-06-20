import { type RiskLevel, type WorkerStatus, type TradeStatus, type TradeSide } from "@prisma/client";

// ─── NextAuth Type Extensions ─────────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isSuperAdmin: boolean;
      isActive: boolean;
      hasCompletedOnboarding: boolean;
    };
  }
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────
export interface BotStatus {
  isLaunched: boolean;
  workerStatus: WorkerStatus;
  lastHeartbeat: string | null;
  lastError: string | null;
  currentCapital: number;
  vault: number;
  totalValue: number;
  riskLevel: RiskLevel;
  isLiveMode: boolean;
}

export interface TradeDTO {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number | null;
  sizeUnits: number;
  positionValueUsd: number;
  pnlUsd: number | null;
  pnlPct: number | null;
  status: TradeStatus;
  side: TradeSide;
  entryTime: string;
  exitTime: string | null;
  exitReason: string | null;
}

export interface DashboardData {
  botStatus: BotStatus;
  activeTrades: TradeDTO[];
  recentTrades: TradeDTO[];
  capitalHistory: CapitalPoint[];
  stats: TradeStats;
}

export interface CapitalPoint {
  date: string;
  value: number;
}

export interface TradeStats {
  totalTrades: number;
  winRate: number;
  totalPnlUsd: number;
  totalPnlPct: number;
  avgPnlUsd: number;
  bestTrade: number;
  worstTrade: number;
}

// ─── Settings Types ───────────────────────────────────────────────────────────
export interface SettingsFormData {
  binanceApiKey?: string;
  binanceSecret?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  riskLevel: RiskLevel;
  initialCapital: number;
}

export interface MaskedSettings {
  binanceApiKeyMasked: string | null;
  binanceSecretMasked: string | null;
  telegramBotTokenMasked: string | null;
  telegramChatId: string | null;
  riskLevel: RiskLevel;
  initialCapital: number;
  currentCapital: number;
  vault: number;
  isLaunched: boolean;
  isLiveMode: boolean;
}

// ─── Admin Types ──────────────────────────────────────────────────────────────
export interface UserAdminView {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  botStatus: {
    isLaunched: boolean;
    workerStatus: WorkerStatus;
    currentCapital: number;
    lastHeartbeat: string | null;
  } | null;
}

export interface PlatformStats {
  totalUsers: number;
  activeBotsCount: number;
  totalCapitalManaged: number;
  avgPnl: number;
  newUsersThisMonth: number;
}

export interface BotCodeFileDTO {
  id: string;
  filename: string;
  content: string;
  version: number;
  isActive: boolean;
  fileSize: number;
  description: string | null;
  updatedAt: string;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
export interface OnboardingStep {
  id: number;
  title: string;
  completed: boolean;
}

export { RiskLevel, WorkerStatus, TradeStatus, TradeSide };
