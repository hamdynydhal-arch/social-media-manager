import type { Metadata } from "next";
import { Bot, Zap, Shield, TrendingUp, Activity } from "lucide-react";

export const metadata: Metadata = { title: "الذراع الرقمي — Spear5" };

const coins = [
  { symbol: "SOL",    name: "Solana",  status: "LONG",    capital: 4_200,  pnlPct: +9.48,  riskLevel: "محافظ" },
  { symbol: "BTC",    name: "Bitcoin", status: "LONG",    capital: 8_500,  pnlPct: +3.68,  riskLevel: "محافظ" },
  { symbol: "TAO",    name: "Bittensor", status: "LONG",  capital: 3_100,  pnlPct: +9.47,  riskLevel: "محافظ" },
  { symbol: "RENDER", name: "Render",  status: "STANDBY", capital: 0,      pnlPct: 0,       riskLevel: "—" },
  { symbol: "FET",    name: "Fetch.ai", status: "STANDBY", capital: 0,     pnlPct: 0,       riskLevel: "—" },
];

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function CryptoAlgoPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-gold-DEFAULT" />
          <h1 className="page-title">غرفة العمليات الرقمية</h1>
          <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full font-mono">
            ACTIVE
          </span>
        </div>
        <p className="page-subtitle">تداول كمي نشط · 5 عملات نخبوية · Workers معزولة · AES-256-GCM</p>
      </div>

      {/* Bot stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Bot,         label: "حالة البوت",       value: "نشط",       color: "text-green-400" },
          { icon: Zap,         label: "مراكز مفتوحة",     value: "3 / 5",     color: "text-gold-DEFAULT" },
          { icon: Shield,      label: "مستوى المخاطرة",   value: "محافظ",     color: "text-gold-DEFAULT" },
          { icon: TrendingUp,  label: "PnL الشهري",       value: "+3.2%",     color: "text-green-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="gold-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className={`text-xl font-black font-mono number-ltr ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Coins table */}
      <div className="gold-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gold-DEFAULT/10 flex items-center gap-2">
          <Activity className="w-4 h-4 text-gold-DEFAULT" />
          <h2 className="text-sm font-semibold text-foreground">العملات النخبوية الـ 5</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-right px-6 py-3 font-medium">العملة</th>
                <th className="text-right px-6 py-3 font-medium">الحالة</th>
                <th className="text-right px-6 py-3 font-medium">الرأسمال</th>
                <th className="text-right px-6 py-3 font-medium">العائد</th>
                <th className="text-right px-6 py-3 font-medium">مستوى المخاطرة</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((c) => (
                <tr key={c.symbol} className="border-b border-border/40 hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black font-mono text-foreground number-ltr">{c.symbol}</div>
                    <div className="text-xs text-muted-foreground">{c.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-mono px-2 py-1 rounded-full border ${
                      c.status === "LONG"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-muted/30 border-border text-muted-foreground"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono number-ltr text-foreground">
                    {c.capital > 0 ? usd(c.capital) : "—"}
                  </td>
                  <td className="px-6 py-4 font-mono number-ltr font-bold">
                    {c.pnlPct !== 0 ? (
                      <span className={c.pnlPct > 0 ? "text-green-400" : "text-red-400"}>
                        {c.pnlPct > 0 ? "+" : ""}{c.pnlPct.toFixed(2)}%
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{c.riskLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
