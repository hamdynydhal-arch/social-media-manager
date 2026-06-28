import { useRef, useState } from 'react';
import type { AttachmentResult, AttachmentContent } from '../engine/attachmentTypes';
import { exportToPdf } from '../utils/exportPdf';

interface AttachmentResultPageProps {
  result: AttachmentResult;
  content: AttachmentContent;
  onRetake: () => void;
  onHome: () => void;
}

export default function AttachmentResultPage({ result, content, onRetake, onHome }: AttachmentResultPageProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [showRefs, setShowRefs] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pattern = content.patterns[result.pattern];

  async function handleDownloadPdf() {
    if (!reportRef.current || pdfLoading) return;
    // Expand refs before capture so they appear in the PDF
    setShowRefs(true);
    setPdfLoading(true);
    await new Promise<void>((r) => setTimeout(r, 120));
    try {
      await exportToPdf(reportRef.current, `psy-نمط-التعلق-${result.pattern}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pb-12">

      {/* Screen-only gradient header with home button */}
      <div className={`bg-gradient-to-l ${pattern.gradientFrom} ${pattern.gradientTo} text-white px-4 pt-10 pb-8 relative`}>
        <div className="max-w-md mx-auto text-center">
          <button
            onClick={onHome}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-sm transition-colors"
          >
            → الرئيسية
          </button>
          <div className="text-6xl mb-3">{pattern.icon}</div>
          <h1 className="text-2xl font-extrabold mb-1">{pattern.name}</h1>
          <p className="text-white/80 text-sm">{pattern.subtitle}</p>
        </div>
      </div>

      {/* ── PDF-capturable content ─────────────────────────────── */}
      <div ref={reportRef} className="max-w-md mx-auto px-4 pt-6 space-y-5">

        {/* PDF header card (compact version of gradient header, visible in exported PDF) */}
        <div className={`bg-gradient-to-l ${pattern.gradientFrom} ${pattern.gradientTo} rounded-3xl p-5 text-white text-center`}>
          <div className="text-4xl mb-2">{pattern.icon}</div>
          <p className="text-xs text-white/70 mb-1">psy · اختبار أسلوب التعلق العاطفي ECR-R</p>
          <h2 className="text-xl font-extrabold mb-0.5">{pattern.name}</h2>
          <p className="text-white/80 text-sm">{pattern.subtitle}</p>
        </div>

        {/* Axis Bars */}
        <div className="card">
          <h2 className="text-sm font-bold text-gray-700 mb-4">درجاتك على المحورين</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-gray-700">قلق التعلق</span>
                <span className="text-sm font-bold text-amber-600">{Math.round(result.anxietyPct)}٪</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${result.anxietyPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>منخفض</span>
                <span>مرتفع</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-gray-700">تجنب التعلق</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(result.avoidancePct)}٪</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-700"
                  style={{ width: `${result.avoidancePct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>منخفض</span>
                <span>مرتفع</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern intro */}
        <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="text-xl">{pattern.icon}</span>
            <p>{pattern.intro}</p>
          </div>
        </div>

        {/* Strengths */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-emerald-500">✦</span> نقاط القوة
          </h2>
          <ul className="space-y-2">
            {pattern.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-amber-500">✦</span> التحديات المحتملة
          </h2>
          <ul className="space-y-2">
            {pattern.challenges.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">◆</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strategies */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-indigo-500">✦</span> استراتيجيات النمو
          </h2>
          <ul className="space-y-2">
            {pattern.strategies.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="text-indigo-400 mt-0.5 flex-shrink-0 font-bold">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="text-rose-500">✦</span> توصيات شخصية
          </h2>
          {[
            { label: 'الوعي الذاتي', icon: '🪞', text: pattern.recommendations.selfAwareness },
            { label: 'التواصل', icon: '💬', text: pattern.recommendations.communication },
            { label: 'الدعم النفسي', icon: '🛋️', text: pattern.recommendations.therapy },
            { label: 'مسار النمو', icon: '🌱', text: pattern.recommendations.growth },
          ].map(({ label, icon, text }) => (
            <div key={label} className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{icon}</span>
                <span className="text-sm font-bold text-gray-700">{label}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Closing message */}
        <div className={`bg-gradient-to-l ${pattern.gradientFrom} ${pattern.gradientTo} rounded-3xl p-5 text-white`}>
          <p className="text-sm leading-relaxed text-center">{content.closingMessage}</p>
        </div>

        {/* Disclaimer — always inside ref for PDF */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-xs text-yellow-800 leading-relaxed">
            ⚠️ <strong>تنبيه:</strong> {content.disclaimer}
          </p>
        </div>

        {/* References — expanded when printing PDF, toggled on screen */}
        {showRefs && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-gray-600 mb-2">📚 المراجع العلمية</h3>
            {content.references.map((ref, i) => (
              <p key={i} className="text-xs text-gray-500 leading-relaxed" dir="ltr">{ref}</p>
            ))}
          </div>
        )}

      </div>
      {/* ── End of PDF-capturable content ─────────────────────── */}

      {/* Screen-only controls (outside PDF ref) */}
      <div className="max-w-md mx-auto px-4 mt-5 space-y-3 pb-8">

        {/* Primary action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onRetake}
            className="py-3 rounded-2xl border-2 border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 active:scale-95 transition-all"
          >
            🔄 إعادة
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className={`
              py-3 rounded-2xl font-bold text-sm transition-all active:scale-95
              flex items-center justify-center gap-1.5
              ${pdfLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-800 text-white shadow-lg shadow-slate-200'
              }
            `}
          >
            {pdfLoading
              ? <><span className="animate-spin text-base">⏳</span></>
              : <><span>📄</span> PDF</>
            }
          </button>
          <button
            onClick={onHome}
            className="py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm active:scale-95 transition-all"
          >
            🏠 رئيسية
          </button>
        </div>

        {/* References toggle for screen */}
        <button
          onClick={() => setShowRefs((v) => !v)}
          className="text-xs text-gray-400 underline w-full text-center"
        >
          {showRefs ? 'إخفاء المراجع العلمية' : 'عرض المراجع العلمية'}
        </button>

      </div>
    </div>
  );
}
