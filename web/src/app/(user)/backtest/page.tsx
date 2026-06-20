import type { Metadata } from "next";

export const metadata: Metadata = { title: "Backtest" };

export default function BacktestPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Backtest</h1>
        <p className="page-subtitle">اختبر استراتيجية البوت على بيانات تاريخية</p>
      </div>
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📈</span>
        </div>
        <h3 className="font-bold text-lg mb-2">Backtest قريباً</h3>
        <p className="text-muted-foreground text-sm">
          سيتوفر Backtest في المرحلة القادمة من التطوير.
        </p>
      </div>
    </div>
  );
}
