"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Shield, AlertTriangle, Cpu, Bot } from "lucide-react";

// ─── Mock data — reflects realistic private fund scale, not exaggerated ───────
const TOTAL_CAPITAL = 47_250;
const MONTHLY_RETURN_USD = 1_512;
const MONTHLY_ROI_PCT = 3.2;
const MAX_DRAWDOWN_PCT = -2.1;

const wealthCurve = [
  { date: "5/6",  value: 45_200 },
  { date: "7/6",  value: 45_680 },
  { date: "9/6",  value: 45_310 },
  { date: "11/6", value: 46_120 },
  { date: "13/6", value: 46_020 },
  { date: "15/6", value: 46_400 },
  { date: "17/6", value: 46_200 },
  { date: "19/6", value: 46_780 },
  { date: "21/6", value: 47_100 },
  { date: "23/6", value: 47_250 },
];

const activePositions = [
  { coin: "SOL",    entry: 142.30,  current: 155.80, sizeUsd: 4_200, pnlPct: +9.48 },
  { coin: "BTC",    entry: 61_200,  current: 63_450, sizeUsd: 8_500, pnlPct: +3.68 },
  { coin: "TAO",    entry: 28.50,   current: 31.20,  sizeUsd: 3_100, pnlPct: +9.47 },
];

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

// ─── Custom Recharts tooltip ──────────────────────────────────────────────────
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-gold-DEFAULT/20 rounded-lg px-3 py-2 text-xs font-mono">
      <span className="text-gold-DEFAULT">{usd(payload[0].value)}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PortfolioOverview() {
  const cryptoAllocation = TOTAL_CAPITAL * 0.65;
  const equitiesAllocation = TOTAL_CAPITAL * 0.35;

  return (
    <div className="space-y-6">
      {/* Dev preview banner */}
      <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-700/30 rounded-lg px-4 py-2 text-xs text-amber-400/80">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        وضع المعاينة — البيانات تمثيلية لمرحلة تطوير الواجهة. سيتم استبدالها ببيانات حية عند ربط البنية التحتية.
      </div>

      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">نظرة عامة على المحفظة</h1>
        <p className="page-subtitle">إجمالي الثروة المُدارة · التوزيع الاستراتيجي · الأداء الكمي</p>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Capital */}
        <div className="gold-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">
            إجمالي الرأسمال المحمي
          </div>
          <div className="text-2xl font-black font-mono number-ltr text-foreground tracking-tight">
            {usd(TOTAL_CAPITAL)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">عبر الذراعين</div>
        </div>

        {/* Monthly ROI */}
        <div className="gold-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">
            العائد الشهري
          </div>
          <div className="text-2xl font-black font-mono number-ltr text-green-400 tracking-tight">
            {pct(MONTHLY_ROI_PCT)}
          </div>
          <div className="text-xs text-green-400/70 mt-1 font-mono number-ltr">+{usd(MONTHLY_RETURN_USD)}</div>
        </div>

        {/* Max Drawdown */}
        <div className="gold-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">
            أقصى تراجع (الشهر)
          </div>
          <div className="text-2xl font-black font-mono number-ltr text-red-400 tracking-tight">
            {pct(MAX_DRAWDOWN_PCT)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">ضمن حدود المخاطرة</div>
        </div>

        {/* Risk Level */}
        <div className="gold-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">
            مستوى المخاطرة
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Shield className="w-5 h-5 text-gold-DEFAULT" />
            <span className="text-xl font-black text-gold-DEFAULT">محافظ</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">وقف كارثي + وقف ATR نشط</div>
        </div>
      </div>

      {/* ── Wealth Curve Chart ── */}
      <div className="gold-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">منحنى نمو الثروة</h2>
            <p className="text-xs text-muted-foreground mt-0.5">آخر 20 يوماً — يونيو 2026</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            {pct(MONTHLY_ROI_PCT)} هذا الشهر
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={wealthCurve} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C9A430" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#C9A430" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1B2D50" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#4A5568", fontSize: 11, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#4A5568", fontSize: 11, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#C9A430"
              strokeWidth={2}
              fill="url(#goldGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#C9A430", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom Row: Positions + Allocation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Active Crypto Positions — 3 cols */}
        <div className="lg:col-span-3 gold-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4 text-gold-DEFAULT" />
            <h2 className="text-sm font-semibold text-foreground">المراكز النشطة — الذراع الرقمي</h2>
            <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-mono mr-auto">
              {activePositions.length} مراكز مفتوحة
            </span>
          </div>
          <div className="space-y-2">
            {activePositions.map((pos) => (
              <div
                key={pos.coin}
                className="flex items-center justify-between bg-navy-700/40 rounded-lg px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-black font-mono text-foreground w-16 number-ltr">{pos.coin}</span>
                  <span className="text-xs text-muted-foreground font-mono number-ltr">
                    دخول: {usd(pos.entry)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-xs text-muted-foreground font-mono number-ltr">
                    {usd(pos.sizeUsd)}
                  </span>
                  <span className={`text-sm font-bold font-mono number-ltr ${pos.pnlPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {pct(pos.pnlPct)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Allocation — 2 cols */}
        <div className="lg:col-span-2 gold-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-gold-DEFAULT" />
            <h2 className="text-sm font-semibold text-foreground">توزيع الأصول</h2>
          </div>

          <div className="space-y-4">
            {/* Crypto bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">الذراع الرقمي (Crypto)</span>
                <span className="font-mono number-ltr text-gold-DEFAULT">65% · {usd(cryptoAllocation)}</span>
              </div>
              <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                <div className="h-full bg-gold-DEFAULT rounded-full" style={{ width: "65%" }} />
              </div>
            </div>

            {/* Equities bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">الأسهم النقية (Halal)</span>
                <span className="font-mono number-ltr text-emerald-400">35% · {usd(equitiesAllocation)}</span>
              </div>
              <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: "35%" }} />
              </div>
              <div className="mt-1 text-[10px] text-emerald-400/60 font-mono">Phase 2 — قيد التفعيل</div>
            </div>

            <div className="border-t border-gold-DEFAULT/10 pt-3 mt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">إجمالي الرأسمال</span>
                <span className="font-mono number-ltr font-bold text-foreground">{usd(TOTAL_CAPITAL)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
