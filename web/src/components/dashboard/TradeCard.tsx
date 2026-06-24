"use client";

import { cn, formatUSD, formatPnl, formatPct, formatDate } from "@/lib/utils";
import type { TradeStatus, TradeSide } from "@prisma/client";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

interface TradeCardProps {
  trade: {
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
  };
}

export function TradeCard({ trade }: TradeCardProps) {
  const isActive = trade.status === "ACTIVE";
  const isProfit = (trade.pnlUsd ?? 0) >= 0;
  const isLong = trade.side === "LONG";

  return (
    <div
      className={cn(
        "glass-card p-4 border transition-all hover:border-border/80",
        isActive && "border-green-900/30 bg-green-950/10"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{trade.symbol.replace("USDT", "/USDT")}</span>
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded font-medium",
              isLong
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            {isLong ? "شراء" : "بيع"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isActive ? (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              نشط
            </span>
          ) : (
            <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
              مغلق
            </span>
          )}
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <span className="text-muted-foreground text-xs block">سعر الدخول</span>
          <span className="font-medium number-ltr">{formatUSD(trade.entryPrice)}</span>
        </div>
        {trade.exitPrice !== null && (
          <div>
            <span className="text-muted-foreground text-xs block">سعر الخروج</span>
            <span className="font-medium number-ltr">{formatUSD(trade.exitPrice)}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground text-xs block">حجم الصفقة</span>
          <span className="font-medium number-ltr">{formatUSD(trade.positionValueUsd)}</span>
        </div>
        <div>
          <span className="text-muted-foreground text-xs block">الكمية</span>
          <span className="font-medium number-ltr">{trade.sizeUnits.toFixed(4)}</span>
        </div>
      </div>

      {/* PnL */}
      {trade.pnlUsd !== null && (
        <div
          className={cn(
            "flex items-center justify-between p-2.5 rounded-lg text-sm font-bold",
            isProfit ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          )}
        >
          <div className="flex items-center gap-1.5">
            {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isProfit ? "ربح" : "خسارة"}</span>
          </div>
          <div className="text-left number-ltr">
            <div>{formatPnl(trade.pnlUsd)}</div>
            <div className="text-xs opacity-75">{formatPct(trade.pnlPct ?? 0)}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(trade.entryTime)}</span>
        </div>
        {trade.exitReason && (
          <span className="text-xs bg-muted/20 px-1.5 py-0.5 rounded">{trade.exitReason}</span>
        )}
      </div>
    </div>
  );
}
