"use client";

import { useState } from "react";
import { History, Filter } from "lucide-react";
import { TradeCard } from "./TradeCard";
import { cn, formatPnl } from "@/lib/utils";
import type { TradeStatus, TradeSide } from "@prisma/client";

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

export function TradesClient({ trades }: { trades: Trade[] }) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "CLOSED">("ALL");
  const [symbolFilter, setSymbolFilter] = useState("");

  const filtered = trades.filter(
    (t) =>
      (filter === "ALL" || t.status === filter) &&
      (!symbolFilter || t.symbol.toLowerCase().includes(symbolFilter.toLowerCase()))
  );

  const closedTrades = trades.filter((t) => t.status === "CLOSED");
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnlUsd ?? 0), 0);
  const winCount = closedTrades.filter((t) => (t.pnlUsd ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">سجل الصفقات</h1>
        <p className="page-subtitle">{trades.length} صفقة إجمالاً</p>
      </div>

      {/* Summary */}
      {closedTrades.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">إجمالي الربح/الخسارة</div>
            <div className={cn("text-xl font-bold number-ltr", totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
              {formatPnl(totalPnl)}
            </div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">نسبة الفوز</div>
            <div className="text-xl font-bold number-ltr">
              {closedTrades.length > 0 ? ((winCount / closedTrades.length) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">صفقات مغلقة</div>
            <div className="text-xl font-bold number-ltr">{closedTrades.length}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-muted/20 rounded-xl p-1">
          {(["ALL", "ACTIVE", "CLOSED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-all",
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "ALL" ? "الكل" : f === "ACTIVE" ? "النشطة" : "المغلقة"}
            </button>
          ))}
        </div>
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            placeholder="فلتر بالعملة..."
            className="bg-card border border-border rounded-xl pr-9 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-40"
          />
        </div>
      </div>

      {/* Trade grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <History className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">لا توجد صفقات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}
