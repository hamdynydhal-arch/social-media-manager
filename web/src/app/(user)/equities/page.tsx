import type { Metadata } from "next";
import { Landmark, Shield, TrendingUp, Clock } from "lucide-react";

export const metadata: Metadata = { title: "الأسهم النقية — Spear5" };

const criteria = [
  "خالٍ من الفوائد الربوية (رأس المال القائم على الدين < 30%)",
  "خالٍ من الغرر — عدم التعامل مع المشتقات المحظورة",
  "خالٍ من القطاعات المحرّمة (الكحول، التبغ، الأسلحة، القمار، الترفيه المحظور)",
  "نسبة الإيرادات المحظورة أقل من 5% من إجمالي الإيرادات",
  "اجتياز الفلترة الشرعية من هيئة معتمدة قبل أي تمركز",
];

const hedgingStrategies = [
  { name: "Long/Short Sector Rotation",     desc: "تدوير قطاعي للتحوط بين أسواق صاعدة وهابطة",      status: "قيد التصميم" },
  { name: "Correlation-Based Hedging",       desc: "تحوط بناءً على الارتباط المنخفض بين الأصول",       status: "قيد التصميم" },
  { name: "Volatility-Triggered Rebalance",  desc: "إعادة توازن تلقائية عند تجاوز حدود التذبذب",     status: "قيد التصميم" },
];

export default function EquitiesPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Landmark className="w-6 h-6 text-emerald-400" />
          <h1 className="page-title">سجل الأسهم النقية</h1>
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-mono">
            Phase 2
          </span>
        </div>
        <p className="page-subtitle">تداول خوارزمي · تصفية شرعية صارمة · تحوط استراتيجي</p>
      </div>

      {/* Phase 2 notice */}
      <div className="bg-emerald-950/20 border border-emerald-700/20 rounded-xl p-5 flex items-start gap-4">
        <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-300">هذا الذراع قيد التفعيل — Phase 2</p>
          <p className="text-xs text-emerald-400/60 mt-1 leading-relaxed">
            البنية التحتية الخوارزمية لسوق الأسهم الشرعية في مرحلة التصميم. سيُنشر عند اكتمال معايير الامتثال الشرعي وربط واجهة برمجة بورصات الأسهم المرخّصة.
          </p>
        </div>
      </div>

      {/* Sharia criteria */}
      <div className="gold-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-foreground">معايير التصفية الشرعية</h2>
        </div>
        <ul className="space-y-3">
          {criteria.map((c) => (
            <li key={c} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Hedging strategies */}
      <div className="gold-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-foreground">استراتيجيات التحوط الاستراتيجي</h2>
        </div>
        <div className="space-y-3">
          {hedgingStrategies.map((s) => (
            <div key={s.name} className="bg-navy-700/40 rounded-lg px-4 py-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-mono font-semibold text-foreground number-ltr">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
              <span className="text-xs text-emerald-400/70 border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded font-mono shrink-0">
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
