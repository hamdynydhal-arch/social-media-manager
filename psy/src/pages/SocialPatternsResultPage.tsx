import { useRef, useState } from 'react';
import type { SocialPatternsResult } from '../engine/socialPatternsTypes';
import { loadHistory } from '../engine/scoring';
import { exportToPdf } from '../utils/exportPdf';
import {
  PATTERNS,
  AXIS_LABELS,
  INTENSITY_LABELS,
  EDUCATIONAL_CARD,
  CONTENT,
} from '../data/socialPatternsContent';

interface SocialPatternsResultPageProps {
  result: SocialPatternsResult;
  onRetake: () => void;
  onHome: () => void;
  onTakeOcean?: () => void;
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

function TipsList({ tips, accentHex }: { tips: string[]; accentHex: string }) {
  return (
    <ul className="space-y-2.5">
      {tips.map((tip, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-nafees-warm-dark leading-relaxed">
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
            style={{ background: accentHex }}
          >
            {i + 1}
          </span>
          <span>{tip}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SocialPatternsResultPage({
  result,
  onRetake,
  onHome,
  onTakeOcean,
  onUpgrade,
}: SocialPatternsResultPageProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [showRefs, setShowRefs] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [eduExpanded, setEduExpanded] = useState(false);
  const [tipsTab, setTipsTab] = useState<'self' | 'partner' | 'colleagues' | 'friends'>('self');

  const pattern = PATTERNS[result.pattern];

  const oceanHistory = loadHistory();
  const latestOcean = oceanHistory[0] ?? null;
  const oceanScores = latestOcean?.scores ?? null;
  const hasOceanData =
    oceanScores &&
    oceanScores.E !== undefined &&
    oceanScores.A !== undefined &&
    oceanScores.C !== undefined &&
    oceanScores.N !== undefined &&
    oceanScores.O !== undefined;

  const axisEntries: Array<{ key: string; pct: number }> = [
    { key: 'D',  pct: result.dominancePct },
    { key: 'Au', pct: result.autonomyPct },
    { key: 'SA', pct: result.accommodationPct },
    { key: 'AS', pct: result.attentionPct },
  ];

  const intensityScore = result.patternScores[result.pattern];
  const intensityLabel = INTENSITY_LABELS[result.intensity];

  const TIPS_TABS = [
    { key: 'self',       label: 'تطور ذاتي',   icon: '🌱' },
    { key: 'partner',    label: 'الأسرة',        icon: '🏠' },
    { key: 'colleagues', label: 'العمل',         icon: '💼' },
    { key: 'friends',    label: 'الأصدقاء',      icon: '🤝' },
  ] as const;

  const currentTips =
    tipsTab === 'self'       ? pattern.tipsSelf :
    tipsTab === 'partner'    ? pattern.tipsPartner :
    tipsTab === 'colleagues' ? pattern.tipsColleagues :
                               pattern.tipsFriends;

  async function handleDownloadPdf() {
    if (!reportRef.current || pdfLoading) return;
    setShowRefs(true);
    setEduExpanded(true);
    setPdfLoading(true);
    await new Promise<void>((r) => setTimeout(r, 200));
    try {
      await exportToPdf(reportRef.current, `psy-أنماط-${result.pattern}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-nafees-cream pb-12" dir="rtl">

      {/* Screen-only hero */}
      <div
        className="text-white px-4 pt-10 pb-10 text-center"
        style={{ background: `linear-gradient(135deg, ${pattern.gradientFrom}, ${pattern.gradientTo})` }}
      >
        <div className="text-6xl mb-3">{pattern.icon}</div>
        <p className="text-white/70 text-xs mb-1 tracking-widest uppercase">{pattern.nameEn}</p>
        <h1 className="text-3xl font-extrabold mb-1">نمط {pattern.name}</h1>
        <p className="text-white/80 text-sm mb-3">{pattern.subtitle}</p>
        <span className="inline-block text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.20)' }}>
          {intensityLabel} · {Math.round(intensityScore)}٪
        </span>
        {result.tier === 'core' ? (
          <div className="mt-2">
            <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-400/25 text-amber-100">
              ⚡ تقييم أساسي · {result.questionCount ?? 12} سؤالاً
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white/75">
              🔬 تقييم معمق · {result.questionCount ?? 49} سؤالاً
            </span>
          </div>
        )}
      </div>

      {/* PDF-capturable content */}
      <div ref={reportRef} className="max-w-md mx-auto px-4 pt-5 space-y-5">

        {/* PDF hero (also renders on screen) */}
        <div
          className="rounded-3xl p-5 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${pattern.gradientFrom}, ${pattern.gradientTo})` }}
        >
          <div className="text-4xl mb-2">{pattern.icon}</div>
          <p className="text-xs text-white/70 mb-1">نفيس · اختبار الأنماط الاجتماعية</p>
          <h2 className="text-xl font-extrabold mb-0.5">نمط {pattern.name}</h2>
          <p className="text-white/80 text-sm">{pattern.tagline}</p>
          <p className="text-white/60 text-xs mt-1">{intensityLabel}</p>
        </div>

        {/* Intro */}
        <div className={`rounded-2xl p-4 ${pattern.cardBg}`}>
          {pattern.intro.split('\n\n').map((para, i) => (
            <p key={i} className={`text-sm leading-relaxed ${pattern.cardText} ${i > 0 ? 'mt-3' : ''}`}>{para}</p>
          ))}
        </div>

        {/* Axis bars */}
        <div className="card">
          <SectionHeading icon="📊" title="درجاتك على الأبعاد الأربعة" />
          <div className="space-y-3">
            {axisEntries.map(({ key, pct }) => {
              const axis = AXIS_LABELS[key];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500">{Math.round(pct)}٪</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${axis.color}`}>{axis.name}</span>
                      <span className="text-sm">{axis.icon}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${axis.barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 text-left">{axis.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern scores comparison */}
        <div className="card border border-nafees-navy/10">
          <SectionHeading icon="⚖️" title="مقارنة الأنماط الأربعة" />
          <div className="space-y-2">
            {(['alpha', 'sigma', 'beta', 'delta'] as const).map((p) => {
              const pc = PATTERNS[p];
              const score = result.patternScores[p];
              const isWinner = p === result.pattern;
              return (
                <div key={p} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isWinner ? 'bg-nafees-navy/5' : ''}`}>
                  <span className="text-lg w-7 text-center">{pc.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className={`text-xs font-bold ${isWinner ? 'text-nafees-navy' : 'text-gray-500'}`}>{pc.name}</span>
                      <span className={`text-xs font-bold ${isWinner ? 'text-nafees-navy' : 'text-gray-400'}`}>{Math.round(score)}٪</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${score}%`, background: isWinner ? pattern.accentHex : '#CBD5E1' }} />
                    </div>
                  </div>
                  {isWinner && <span className="text-[10px] font-bold text-nafees-navy bg-nafees-navy/10 px-2 py-0.5 rounded-full">نمطك</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Challenges */}
        <div className="card border border-emerald-100">
          <SectionHeading icon="✦" title="نقاط قوتك" />
          <ul className="space-y-2 mb-5">
            {pattern.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-900 leading-relaxed">
                <span className="text-emerald-500 flex-shrink-0 mt-0.5 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <SectionHeading icon="⚠️" title="تحديات تستحق التأمل" />
          <ul className="space-y-2">
            {pattern.challenges.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900 leading-relaxed">
                <span className="text-amber-500 flex-shrink-0 mt-0.5 font-bold">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Social profile */}
        <div className="rounded-2xl p-4" style={{ background: `${pattern.accentHex}18` }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: pattern.accentHex }}>🌐 ملفك الاجتماعي</h3>
          <p className="text-sm text-nafees-warm-dark leading-relaxed">{pattern.socialProfile}</p>
        </div>

        {/* Professional profile */}
        <div className="card border border-nafees-navy/10">
          <SectionHeading icon="💼" title="ملفك المهني" subtitle="أسلوبك في العمل وبيئات ازدهارك" />
          {pattern.professionalProfile.split('\n\n').map((para, i) => (
            <p key={i} className={`text-sm text-nafees-warm-dark leading-relaxed ${i > 0 ? 'mt-3' : ''}`}>{para}</p>
          ))}
        </div>

        {/* Emotional profile */}
        <div className="card border border-nafees-navy/10">
          <SectionHeading icon="💙" title="ملفك العاطفي" subtitle="كيف تُحبّ وكيف تحتاج أن تُحَبّ" />
          {pattern.emotionalProfile.split('\n\n').map((para, i) => (
            <p key={i} className={`text-sm text-nafees-warm-dark leading-relaxed ${i > 0 ? 'mt-3' : ''}`}>{para}</p>
          ))}
        </div>

        {/* Tips — tabbed for screen, all expanded for PDF */}
        <div className="card border border-nafees-navy/10">
          <SectionHeading icon="🗺️" title="دليلك للتطور الذاتي" subtitle="نصائح عملية لك ولمن حولك" />

          {/* Tab buttons — screen only */}
          <div className="grid grid-cols-4 gap-1 mb-4 print:hidden">
            {TIPS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTipsTab(tab.key)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all active:scale-95 flex flex-col items-center gap-0.5
                  ${tipsTab === tab.key
                    ? 'text-white shadow-sm'
                    : 'bg-nafees-navy/5 text-nafees-warm hover:bg-nafees-navy/10'
                  }`}
                style={tipsTab === tab.key ? { background: pattern.accentHex } : {}}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Screen: active tab tips */}
          <div className="print:hidden">
            <TipsList tips={currentTips} accentHex={pattern.accentHex} />
          </div>

          {/* PDF: all tabs expanded */}
          <div className="hidden print:block space-y-5">
            {TIPS_TABS.map((tab) => {
              const tips =
                tab.key === 'self'       ? pattern.tipsSelf :
                tab.key === 'partner'    ? pattern.tipsPartner :
                tab.key === 'colleagues' ? pattern.tipsColleagues :
                                           pattern.tipsFriends;
              return (
                <div key={tab.key}>
                  <p className="text-xs font-bold text-nafees-warm mb-2">{tab.icon} {tab.label}</p>
                  <TipsList tips={tips} accentHex={pattern.accentHex} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Educational card */}
        <div className="card border border-nafees-sky/30 bg-nafees-sky/5">
          <button className="w-full text-right" onClick={() => setEduExpanded((v) => !v)}>
            <div className="flex items-center justify-between">
              <span className="text-nafees-blue">{eduExpanded ? '▲' : '▼'}</span>
              <div className="text-right">
                <p className="text-xs font-bold text-nafees-blue">💡 هل تعلم؟</p>
                <h3 className="text-sm font-extrabold text-nafees-navy">{EDUCATIONAL_CARD.shortTitle}</h3>
              </div>
            </div>
            {!eduExpanded && (
              <p className="text-xs text-nafees-warm mt-2 text-right leading-relaxed">{EDUCATIONAL_CARD.shortSnippet}</p>
            )}
          </button>
          {eduExpanded && (
            <div className="mt-4 space-y-3 border-t border-nafees-sky/30 pt-4">
              <h3 className="text-sm font-extrabold text-nafees-navy">{EDUCATIONAL_CARD.fullTitle}</h3>
              {EDUCATIONAL_CARD.story.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-nafees-warm-dark leading-relaxed">{para}</p>
              ))}
              <div className="bg-nafees-navy/5 rounded-xl p-3">
                <p className="text-xs text-nafees-navy leading-relaxed">{EDUCATIONAL_CARD.conclusion}</p>
              </div>
            </div>
          )}
        </div>

        {/* Scientific Translation */}
        <div className="card border border-nafees-navy/15">
          <SectionHeading icon="🔬" title="التشريح العلمي" subtitle="الارتباط بنموذج العوامل الخمسة الكبرى" />

          {hasOceanData ? (
            <div className="space-y-4">
              <div className="bg-nafees-navy/5 rounded-2xl p-4">
                <p className="text-sm text-nafees-navy leading-relaxed font-medium">
                  {pattern.oceanReading({
                    E: oceanScores!.E!,
                    A: oceanScores!.A!,
                    C: oceanScores!.C!,
                    N: oceanScores!.N!,
                    O: oceanScores!.O!,
                  })}
                </p>
              </div>
              <div className="space-y-3">
                {pattern.oceanCorrelations.map((corr) => {
                  const actualScore = oceanScores![corr.factor] ?? 50;
                  const isConsistent =
                    (corr.direction === 'high' && actualScore >= 55) ||
                    (corr.direction === 'low'  && actualScore <= 45);
                  return (
                    <div key={corr.factor} className={`rounded-xl p-3 border ${isConsistent ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isConsistent ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                          {isConsistent ? 'متسق مع نمطك' : 'جانب مثير للاهتمام'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-700">{corr.label}</span>
                          <span className="text-base font-bold text-nafees-navy">{corr.factor}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-nafees-navy rounded-full" style={{ width: `${actualScore}%` }} />
                        </div>
                        <span className="text-xs font-bold text-nafees-navy w-8 text-left">{Math.round(actualScore)}٪</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{corr.explanation}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 text-center">البيانات من اختبار الشخصية الكبير · r = معامل الارتباط العلمي المُوثَّق</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-2xl p-4 ${pattern.cardBg}`}>
                <p className={`text-sm leading-relaxed ${pattern.cardText}`}>{pattern.oceanExpected}</p>
              </div>
              <div className="space-y-3">
                {pattern.oceanCorrelations.map((corr) => (
                  <div key={corr.factor} className="rounded-xl p-3 border bg-gray-50 border-gray-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-nafees-navy/10 text-nafees-navy">
                        ارتباط متوقع r = {corr.r > 0 ? '+' : ''}{corr.r}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-700">{corr.label}</span>
                        <span className="text-base font-bold text-nafees-navy">{corr.factor}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{corr.explanation}</p>
                  </div>
                ))}
              </div>
              {onTakeOcean && (
                <button
                  onClick={onTakeOcean}
                  className="w-full py-3 rounded-2xl bg-nafees-navy text-white font-bold text-sm active:scale-95 transition-all"
                >
                  🔬 أجرِ اختبار الشخصية لرؤية درجاتك الحقيقية
                </button>
              )}
            </div>
          )}
        </div>

        {/* Closing */}
        <div
          className="rounded-3xl p-5 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${pattern.gradientFrom}, ${pattern.gradientTo})` }}
        >
          <p className="text-sm leading-relaxed">{CONTENT.closingMessage}</p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-xs text-yellow-800 leading-relaxed">
            ⚠️ <strong>تنبيه:</strong> {CONTENT.disclaimer}
          </p>
        </div>

        {/* References */}
        {showRefs && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-gray-600 mb-2">📚 المراجع العلمية</h3>
            {CONTENT.references.map((ref, i) => (
              <p key={i} className="text-xs text-gray-500 leading-relaxed" dir="ltr">{ref}</p>
            ))}
          </div>
        )}
      </div>
      {/* End PDF content */}

      {/* Screen-only action bar */}
      <div className="max-w-md mx-auto px-4 mt-5 space-y-3 pb-8">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onRetake}
            className="py-3 rounded-2xl border-2 border-nafees-navy/30 text-nafees-navy font-bold text-sm hover:bg-nafees-navy/10 active:scale-95 transition-all"
          >
            🔄 إعادة
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className={`py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5
              ${pdfLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-800 text-white shadow-lg'}`}
          >
            {pdfLoading ? <span className="animate-spin text-base">⏳</span> : <><span>📄</span> PDF</>}
          </button>
          <button
            onClick={onHome}
            className="py-3 rounded-2xl bg-nafees-navy hover:bg-nafees-blue text-white font-bold text-sm active:scale-95 transition-all"
          >
            🏠 رئيسية
          </button>
        </div>
        {/* Upgrade to deep tier */}
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="w-full py-3 rounded-2xl bg-nafees-navy hover:bg-nafees-blue text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>🔬</span>
            ارقَ إلى التقييم المعمق (49 سؤالاً · ~10 دقائق)
          </button>
        )}

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
