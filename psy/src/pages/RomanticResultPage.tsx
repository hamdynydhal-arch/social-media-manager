import { useRef, useState } from 'react';
import type { RomanticResult, RomanticAxis } from '../engine/romanticTypes';
import { exportToPdf } from '../utils/exportPdf';
import { ROMANTIC_CONTENT, AXIS_LABELS } from '../data/romanticContent';

interface RomanticResultPageProps {
  result: RomanticResult;
  onRetake: () => void;
  onHome: () => void;
  onUpgrade?: () => void;
}

function SectionHeading({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xl">{icon}</span>
      <div>
        <h2 className="text-sm font-extrabold text-nafees-navy leading-tight">{title}</h2>
        {subtitle && <p className="text-[10px] text-nafees-warm">{subtitle}</p>}
      </div>
    </div>
  );
}

const INTENSITY_LABELS: Record<string, string> = {
  strong: 'تعبير قوي',
  moderate: 'تعبير معتدل',
  mild: 'تعبير خفيف',
};

const AXIS_ORDER: RomanticAxis[] = ['WA', 'QT', 'AS', 'PT', 'PA', 'SE'];

export default function RomanticResultPage({
  result,
  onRetake,
  onHome,
  onUpgrade,
}: RomanticResultPageProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPartnerGuide, setShowPartnerGuide] = useState(false);
  const [showRefs, setShowRefs] = useState(false);

  const archContent = ROMANTIC_CONTENT.archetypes[result.archetype];
  const intensityLabel = INTENSITY_LABELS[result.intensity];
  const dominantScore = result.axisPcts[result.dominantAxis];

  async function handleDownloadPdf() {
    if (!reportRef.current || pdfLoading) return;
    setShowRefs(true);
    setShowPartnerGuide(true);
    setPdfLoading(true);
    await new Promise<void>((r) => setTimeout(r, 200));
    try {
      await exportToPdf(reportRef.current, `نفيس-شيفرة-عاطفية-${result.archetype}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-nafees-cream pb-12" dir="rtl">

      {/* Hero */}
      <div
        className="text-white px-4 pt-10 pb-10 text-center"
        style={{ background: `linear-gradient(135deg, ${archContent.gradientFrom}, ${archContent.gradientTo})` }}
      >
        <div className="text-6xl mb-3">{archContent.icon}</div>
        <h1 className="text-3xl font-extrabold mb-1">{archContent.name}</h1>
        <p className="text-white/80 text-sm mb-3">{archContent.subtitle}</p>
        <span className="inline-block text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.20)' }}>
          {intensityLabel} · {Math.round(dominantScore)}٪
        </span>
        {result.tier === 'core' ? (
          <div className="mt-2">
            <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-400/25 text-amber-100">
              ⚡ تقييم أساسي · {result.questionCount} سؤالاً
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white/75">
              🔍 تقييم معمّق · {result.questionCount} سؤالاً
            </span>
          </div>
        )}
      </div>

      {/* PDF-capturable content */}
      <div ref={reportRef} className="max-w-md mx-auto px-4 pt-5 space-y-5">

        {/* PDF hero */}
        <div
          className="rounded-3xl p-5 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${archContent.gradientFrom}, ${archContent.gradientTo})` }}
        >
          <div className="text-4xl mb-2">{archContent.icon}</div>
          <p className="text-xs text-white/70 mb-1">نفيس · مقياس الشيفرة العاطفية والحميمية</p>
          <h2 className="text-xl font-extrabold mb-0.5">{archContent.name}</h2>
          <p className="text-white/80 text-sm">{archContent.subtitle}</p>
          <p className="text-white/60 text-xs mt-1">{intensityLabel} · {Math.round(dominantScore)}٪</p>
        </div>

        {/* Intro */}
        <div className="card">
          {archContent.intro.split('\n\n').map((para, i) => (
            <p key={i} className={`text-sm leading-relaxed text-nafees-warm-dark ${i > 0 ? 'mt-3' : ''}`}>{para}</p>
          ))}
        </div>

        {/* Spectrum note (compassionate) */}
        {result.intensity === 'mild' && (
          <div className="rounded-2xl p-4 border border-amber-200 bg-amber-50">
            <p className="text-sm leading-relaxed text-amber-800">
              <span className="font-bold">ملاحظة: </span>{archContent.spectrumNote}
            </p>
          </div>
        )}

        {/* Axis bars */}
        <div className="card">
          <SectionHeading icon="📊" title="درجاتك على الأبعاد الستة" subtitle="مبنية على لغات تشابمان وستيرنبرغ" />
          <div className="space-y-3">
            {AXIS_ORDER.map((axis) => {
              const pct = result.axisPcts[axis];
              const info = AXIS_LABELS[axis];
              const isDominant = axis === result.dominantAxis;
              const isSecondary = axis === result.secondaryAxis;
              return (
                <div key={axis}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500">{Math.round(pct)}٪</span>
                    <div className="flex items-center gap-1.5">
                      {isDominant && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">رئيسي</span>}
                      {isSecondary && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">ثانوي</span>}
                      <span className={`text-xs font-bold ${info.color}`}>{info.name}</span>
                      <span className="text-sm">{info.icon}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${info.barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 text-left">{info.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dominant + Secondary */}
        <div className="card border border-nafees-navy/10">
          <SectionHeading icon="🎯" title="اللغة العاطفية الأساسية والثانوية" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3 text-center" style={{ background: `${archContent.gradientFrom}15` }}>
              <div className="text-2xl mb-1">{AXIS_LABELS[result.dominantAxis].icon}</div>
              <p className="text-[10px] text-gray-500 mb-0.5">اللغة الرئيسية</p>
              <p className="text-xs font-bold text-nafees-navy">{AXIS_LABELS[result.dominantAxis].name}</p>
            </div>
            <div className="rounded-2xl p-3 text-center bg-slate-50">
              <div className="text-2xl mb-1">{AXIS_LABELS[result.secondaryAxis].icon}</div>
              <p className="text-[10px] text-gray-500 mb-0.5">اللغة الثانوية</p>
              <p className="text-xs font-bold text-nafees-navy">{AXIS_LABELS[result.secondaryAxis].name}</p>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div className="card">
          <SectionHeading icon="✨" title="نقاط قوتك في العلاقات" />
          <ul className="space-y-2.5">
            {archContent.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-nafees-warm-dark leading-relaxed">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
                  style={{ background: archContent.gradientFrom }}
                >
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div className="card border border-amber-100 bg-amber-50/30">
          <SectionHeading icon="⚡" title="التحديات التي قد تواجهها" />
          <ul className="space-y-2">
            {archContent.challenges.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-nafees-warm-dark leading-relaxed">
                <span className="flex-shrink-0 text-amber-500 mt-0.5">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth path */}
        <div className="card border border-emerald-100 bg-emerald-50/30">
          <SectionHeading icon="🌱" title="مسار النمو العاطفي" />
          <p className="text-sm text-nafees-warm-dark leading-relaxed">{archContent.growthPath}</p>
        </div>

        {/* Partner Guide — expandable */}
        <div className="card border border-rose-200 bg-rose-50/30">
          <button
            className="w-full text-right"
            onClick={() => setShowPartnerGuide((v) => !v)}
          >
            <div className="flex items-center justify-between">
              <span className="text-rose-400 text-lg">{showPartnerGuide ? '▲' : '▼'}</span>
              <div>
                <SectionHeading icon="💑" title="دليل الشريك الحميمي" subtitle="كيف تُحبّه، تُشعله، وتحافظ على اللهب" />
              </div>
            </div>
          </button>

          {showPartnerGuide && (
            <div className="mt-3 space-y-4 border-t border-rose-100 pt-4">
              <div className="rounded-2xl p-4 bg-white border border-rose-100">
                <h4 className="text-xs font-bold text-rose-600 mb-2">🔍 كيف تفهمه</h4>
                <p className="text-sm text-nafees-warm-dark leading-relaxed">{archContent.partnerGuide.understand}</p>
              </div>
              <div className="rounded-2xl p-4 bg-white border border-orange-100">
                <h4 className="text-xs font-bold text-orange-600 mb-2">🔥 ما يُشعل جذوته</h4>
                <p className="text-sm text-nafees-warm-dark leading-relaxed">{archContent.partnerGuide.ignite}</p>
              </div>
              <div className="rounded-2xl p-4 bg-white border border-slate-100">
                <h4 className="text-xs font-bold text-slate-600 mb-2">❄️ ما يُطفئ اللهب</h4>
                <p className="text-sm text-nafees-warm-dark leading-relaxed">{archContent.partnerGuide.extinguish}</p>
              </div>
              <div className="rounded-2xl p-4 bg-white border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-600 mb-2">🌱 عادة يومية واحدة</h4>
                <p className="text-sm text-nafees-warm-dark leading-relaxed">{archContent.partnerGuide.dailyPractice}</p>
              </div>
            </div>
          )}
        </div>

        {/* References (shown in PDF) */}
        {showRefs && (
          <div className="card border border-nafees-sky/20 bg-nafees-sky/5">
            <h3 className="text-xs font-bold text-nafees-blue mb-2">المراجع العلمية</h3>
            <ul className="space-y-1 text-[10px] text-nafees-warm leading-relaxed">
              <li>Chapman, G. D. (1992). <em>The Five Love Languages</em>. Northfield Publishing.</li>
              <li>Sternberg, R. J. (1986). A triangular theory of love. <em>Psychological Review, 93</em>(2), 119–135.</li>
              <li>Fraley, R. C., Waller, N. G., & Brennan, K. A. (2000). An item response theory analysis of self-report measures of adult attachment. <em>Journal of Personality and Social Psychology, 78</em>(2), 350–365.</li>
              <li>Mikulincer, M., & Shaver, P. R. (2007). <em>Attachment in Adulthood</em>. Guilford Press.</li>
            </ul>
          </div>
        )}

        {/* Closing message */}
        <div className="text-center py-3">
          <p className="text-xs text-nafees-warm leading-relaxed px-4">{ROMANTIC_CONTENT.closingMessage}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="max-w-md mx-auto px-4 mt-6 space-y-3">

        {/* PDF Download */}
        <button
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
          className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #BE185D, #881337)' }}
        >
          {pdfLoading ? (
            <><span className="animate-spin">⏳</span> جاري التحميل...</>
          ) : (
            <><span>📄</span> تحميل التقرير PDF</>
          )}
        </button>

        {/* Upgrade (if core tier) */}
        {onUpgrade && result.tier === 'core' && (
          <button
            onClick={onUpgrade}
            className="w-full py-3 rounded-2xl border-2 border-rose-300 text-rose-700 font-bold text-sm active:scale-95 transition-all"
          >
            🔍 تعمّق أكثر — 70 سؤالاً
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRetake}
            className="py-3 rounded-2xl border-2 border-nafees-navy/30 text-nafees-navy font-bold text-sm active:scale-95 transition-all"
          >
            إعادة الاختبار
          </button>
          <button
            onClick={onHome}
            className="py-3 rounded-2xl bg-nafees-navy text-white font-bold text-sm active:scale-95 transition-all"
          >
            🏠 الرئيسية
          </button>
        </div>

        <button
          onClick={() => setShowRefs((v) => !v)}
          className="w-full py-2 text-xs text-nafees-warm text-center"
        >
          {showRefs ? 'إخفاء المراجع' : '📚 المراجع العلمية'}
        </button>
      </div>
    </div>
  );
}
