"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BotStatusIndicator } from "./BotStatusIndicator";
import { CapitalChart } from "./CapitalChart";
import { TradeCard } from "./TradeCard";
import { StatsCard } from "./StatsCard";
import { EmergencyStopButton } from "./EmergencyStopButton";
import { formatUSD, formatPnl, formatPct } from "@/lib/utils";
import type { RiskLevel, WorkerStatus, TradeStatus, TradeSide } from "@prisma/client";
import { TrendingUp, TrendingDown, Activity, Wallet, PiggyBank, Rocket } from "lucide-react";

interface Trade {
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

interface BotConfig {
  isLaunched: boolean;
  workerStatus: WorkerStatus;
  lastHeartbeat: string | null;
  lastError: string | null;
  currentCapital: number;
  vault: number;
  riskLevel: RiskLevel;
  isLiveMode: boolean;
  initialCapital: number;
}

interface Stats {
  totalTrades: number;
  winRate: number;
  totalPnlUsd: number;
  totalPnlPct: number;
  avgPnlUsd: number;
  bestTrade: number;
  worstTrade: number;
}

interface DashboardClientProps {
  botConfig: BotConfig | null;
  activeTrades: Trade[];
  recentTrades: Trade[];
  stats: Stats;
}

export function DashboardClient({
  botConfig,
  activeTrades,
  recentTrades,
  stats,
}: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const [localLaunched, setLocalLaunched] = useState(botConfig?.isLaunched ?? false);

  const totalValue = (botConfig?.currentCapital ?? 0) + (botConfig?.vault ?? 0);
  const profitLoss = totalValue - (botConfig?.initialCapital ?? 0);
  const isProfit = profitLoss >= 0;

  async function handleLaunch() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/bot/launch", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setLocalLaunched(true);
          toast.success("تم إطلاق البوت بنجاح");
        } else {
          toast.error(data.error ?? "فشل إطلاق البوت");
        }
      } catch {
        toast.error("خطأ في الاتصال بالخادم");
      }
    });
  }

  async function handleStop() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/bot/stop", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setLocalLaunched(false);
          toast.success("تم إيقاف البوت");
        } else {
          toast.error(data.error ?? "فشل إيقاف البوت");
        }
      } catch {
        toast.error("خطأ في الاتصال بالخادم");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء البوت والصفقات</p>
        </div>
        <div className="flex items-center gap-3">
          {localLaunched ? (
            <EmergencyStopButton onStop={handleStop} loading={isPending} />
          ) : (
            <button
              onClick={handleLaunch}
              disabled={isPending || !botConfig?.isLiveMode}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              <Rocket className="w-4 h-4" />
              {isPending ? "جارٍ الإطلاق..." : "إطلاق البوت"}
            </button>
          )}
        </div>
      </div>

      {/* Bot status banner */}
      <BotStatusIndicator
        isLaunched={localLaunched}
        workerStatus={botConfig?.workerStatus ?? "STOPPED"}
        lastHeartbeat={botConfig?.lastHeartbeat ?? null}
        lastError={botConfig?.lastError ?? null}
        riskLevel={botConfig?.riskLevel ?? "BALANCED"}
        isLiveMode={botConfig?.isLiveMode ?? false}
      />

      {/* Capital cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCard
            icon={Wallet}
            label="رأس المال الحالي"
            value={formatUSD(botConfig?.currentCapital ?? 0)}
            color="green"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatsCard
            icon={PiggyBank}
            label="الخزنة"
            value={formatUSD(botConfig?.vault ?? 0)}
            color="blue"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatsCard
            icon={Activity}
            label="المجموع"
            value={formatUSD(totalValue)}
            color="purple"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <StatsCard
            icon={isProfit ? TrendingUp : TrendingDown}
            label="الربح / الخسارة"
            value={formatPnl(profitLoss)}
            subValue={formatPct(stats.totalPnlPct)}
            color={isProfit ? "green" : "red"}
          />
        </motion.div>
      </div>

      {/* Chart + Trade stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CapitalChart initialCapital={botConfig?.initialCapital ?? 0} trades={recentTrades} />
        </div>
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
              إحصائيات الأداء
            </h3>
            <div className="space-y-3">
              <StatRow label="إجمالي الصفقات" value={stats.totalTrades.toString()} />
              <StatRow
                label="نسبة الربح"
                value={`${stats.winRate.toFixed(1)}%`}
                color={stats.winRate >= 50 ? "green" : "red"}
              />
              <StatRow
                label="متوسط الصفقة"
                value={formatPnl(stats.avgPnlUsd)}
                color={stats.avgPnlUsd >= 0 ? "green" : "red"}
              />
              <StatRow
                label="أفضل صفقة"
                value={formatUSD(stats.bestTrade)}
                color="green"
              />
              <StatRow
                label="أسوأ صفقة"
                value={formatUSD(stats.worstTrade)}
                color="red"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active trades */}
      {activeTrades.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">
            الصفقات النشطة{" "}
            <span className="text-sm font-normal text-muted-foreground">({activeTrades.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeTrades.map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        </section>
      )}

      {/* Recent trades */}
      <section>
        <h2 className="text-xl font-bold mb-4">
          آخر الصفقات المغلقة{" "}
          <span className="text-sm font-normal text-muted-foreground">({recentTrades.length})</span>
        </h2>
        {recentTrades.length === 0 ? (
          <EmptyTrades />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentTrades.slice(0, 6).map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "green" | "red";
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          color === "green"
            ? "text-green-400 font-medium number-ltr"
            : color === "red"
            ? "text-red-400 font-medium number-ltr"
            : "font-medium number-ltr"
        }
      >
        {value}
      </span>
    </div>
  );
}

function EmptyTrades() {
  return (
    <div className="glass-card p-12 text-center">
      <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
      <p className="text-muted-foreground text-sm">لا توجد صفقات مغلقة بعد</p>
      <p className="text-muted-foreground text-xs mt-1">ستظهر الصفقات هنا بعد إطلاق البوت</p>
    </div>
  );
}
