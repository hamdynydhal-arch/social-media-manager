import type { Metadata } from "next";
import { Cpu, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";

export const metadata: Metadata = { title: "الرؤى الكمية — Spear5" };

// Mock quant signals — realistic, not exaggerated
const signals = [
  {
    coin:      "SOL",
    signal:    "HOLD",
    strength:  72,
    basis:     "ATR Trailing Stop ضمن النطاق · RSI 58 · Trend Intact",
    updated:   "منذ 4 دقائق",
    color:     "text-gold-DEFAULT",
  },
  {
    coin:      "BTC",
    signal:    "HOLD",
    strength:  65,
    basis:     "تجاور المقاومة عند $64K · انتظار تأكيد الكسر",
    updated:   "منذ 9 دقائق",
    color:     "text-gold-DEFAULT",
  },
  {
    coin:      "TAO",
    signal:    "REDUCE",
    strength:  48,
    basis:     "تقارب Bollinger Bands · تراجع الزخم على الإطار اليومي",
    updated:   "منذ 17 دقيقة",
    color:     "text-amber-400",
  },
  {
    coin:      "RENDER",
    signal:    "WATCH",
    strength:  55,
    basis:     "إشارة اختراق محتملة · بانتظار حجم تداول كافٍ",
    updated:   "منذ 22 دقيقة",
    color:     "text-muted-foreground",
  },
  {
    coin:      "FET",
    signal:    "WATCH",
    strength:  51,
    basis:     "ارتباط منخفض مع BTC — مراقبة أداء مستقل",
    updated:   "منذ 31 دقيقة",
    color:     "text-muted-foreground",
  },
];

const SignalIcon = ({ signal }: { signal: string }) => {
  if (signal === "BUY")    return <TrendingUp  className="w-4 h-4 text-green-400" />;
  if (signal === "SELL")   return <TrendingDown className="w-4 h-4 text-red-400" />;
  if (signal === "REDUCE") return <TrendingDown className="w-4 h-4 text-amber-400" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

export default function SignalsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-gold-DEFAULT" />
          <h1 className="page-title">الرؤى الكمية</h1>
          <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-mono">
            Dev Preview
          </span>
        </div>
        <p className="page-subtitle">إشارات الخوارزميات · توصيات التمركز · تحليل الزخم</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-navy-800/60 border border-gold-DEFAULT/10 rounded-xl p-4 flex items-center gap-3 text-xs text-muted-foreground">
        <Clock className="w-4 h-4 text-gold-DEFAULT shrink-0" />
        هذه الإشارات مشتقة من نموذج ATR + RSI + Bollinger. ليست توصيات استثمارية. قرار التنفيذ يقع على عاتق المُصرَّح حصراً.
      </div>

      {/* Signals table */}
      <div className="gold-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gold-DEFAULT/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">إشارات العملات الـ 5</h2>
          <span className="text-xs text-muted-foreground font-mono">يتجدد كل دقيقتين</span>
        </div>
        <div className="divide-y divide-border/40">
          {signals.map((s) => (
            <div key={s.coin} className="px-6 py-4 flex items-start gap-4 hover:bg-white/[0.01] transition-colors">
              {/* Coin */}
              <div className="w-16 shrink-0">
                <div className="font-black font-mono text-foreground number-ltr">{s.coin}</div>
              </div>

              {/* Signal badge */}
              <div className="flex items-center gap-1.5 w-24 shrink-0">
                <SignalIcon signal={s.signal} />
                <span className={`text-xs font-mono font-bold ${s.color}`}>{s.signal}</span>
              </div>

              {/* Strength bar */}
              <div className="flex-1 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-DEFAULT/60 rounded-full"
                      style={{ width: `${s.strength}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-8 number-ltr">{s.strength}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.basis}</p>
              </div>

              {/* Updated */}
              <div className="text-xs text-muted-foreground shrink-0 font-mono">{s.updated}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
