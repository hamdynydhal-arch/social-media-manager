import { useMemo } from 'react';
import { runSynthesis, saveSynthesisResult } from '../engine/synthesisEngine';
import type { PersonaDimension, SynthesisPattern, ConfidenceLevel } from '../engine/synthesisTypes';

interface SynthesisPageProps {
  onHome: () => void;
}

const DIMENSION_ICONS: Record<string, string> = {
  emotional_regulation:  '🌊',
  interpersonal_trust:   '🤝',
  relational_closeness:  '💫',
  self_worth:            '🌱',
  autonomy_achievement:  '🧭',
};

const DIMENSION_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  emotional_regulation: { bar: 'bg-nafees-blue',      bg: 'bg-nafees-sky/10',     text: 'text-nafees-blue'      },
  interpersonal_trust:  { bar: 'bg-nafees-sage',      bg: 'bg-nafees-sage/10',    text: 'text-nafees-sage'      },
  relational_closeness: { bar: 'bg-nafees-copper',    bg: 'bg-nafees-copper/10',  text: 'text-nafees-copper'    },
  self_worth:           { bar: 'bg-nafees-navy',      bg: 'bg-nafees-navy/10',    text: 'text-nafees-navy'      },
  autonomy_achievement: { bar: 'bg-nafees-blue-mid',  bg: 'bg-nafees-sky/15',     text: 'text-nafees-blue-mid'  },
};

const CONFIDENCE_META: Record<ConfidenceLevel, { label: string; color: string; detail: string }> = {
  high:     { label: 'مرتفعة', color: 'text-nafees-sage',   detail: 'مبني على 3 اختبارات مكتملة' },
  moderate: { label: 'متوسطة', color: 'text-nafees-copper', detail: 'مبني على اختبارين — أكمل الثالث لرفع الدقة' },
  low:      { label: 'منخفضة', color: 'text-nafees-warm',   detail: 'اختبار واحد فقط — أكمل الاختبارات الثلاثة' },
};

function DimensionCard({ dim }: { dim: PersonaDimension }) {
  const colors = DIMENSION_COLORS[dim.id] ?? DIMENSION_COLORS.emotional_regulation;
  const icon   = DIMENSION_ICONS[dim.id] ?? '◆';
  const pct    = Math.round(dim.score);

  return (
    <div className={`rounded-2xl p-4 ${colors.bg} border border-nafees-cream-dark/30`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className={`text-sm font-bold ${colors.text}`}>{dim.title}</span>
            <span className={`text-xs font-bold ${colors.text}`}>{pct}%</span>
          </div>
          <div className="h-2 bg-nafees-cream-dark/40 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-nafees-warm-dark leading-relaxed">{dim.description}</p>

      {dim.patterns.length > 0 && (
        <div className="mt-3 pt-3 border-t border-nafees-cream-dark/30 space-y-2">
          {dim.patterns.map((p: SynthesisPattern) => (
            <div key={p.id} className="bg-white/60 rounded-xl p-3">
              <p className={`text-xs font-bold mb-1 ${colors.text}`}>✦ {p.label}</p>
              <p className="text-[11px] text-nafees-warm-dark leading-relaxed">{p.description}</p>
              <p className="text-[10px] text-nafees-warm mt-1.5">
                {p.literatureSources.join(' · ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SynthesisPage({ onHome }: SynthesisPageProps) {
  const result = useMemo(() => {
    const r = runSynthesis();
    saveSynthesisResult(r);
    return r;
  }, []);

  const confidence = CONFIDENCE_META[result.confidence];
  const noTests    = result.completedTests.length === 0;

  return (
    <div className="min-h-screen bg-nafees-cream" dir="rtl">

      {/* Header */}
      <div className="w-full bg-nafees-navy text-center px-4 pt-10 pb-8 rounded-b-[2.5rem]">
        <div className="text-3xl mb-2">🧬</div>
        <h1 className="text-2xl font-bold text-nafees-cream mb-1" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
          التوليف النفسي
        </h1>
        <p className="text-nafees-sky text-xs">تحليل تقاطعي بين الاختبارات الثلاثة</p>

        {/* Confidence badge */}
        <div className="inline-flex items-center gap-1.5 mt-3 bg-white/10 px-3 py-1.5 rounded-full">
          <span className="text-nafees-cream-dark text-xs">دقة التحليل:</span>
          <span className={`text-xs font-bold ${confidence.color}`}>{confidence.label}</span>
        </div>
        <p className="text-nafees-cream-dark/60 text-[10px] mt-1">{confidence.detail}</p>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 pb-20 space-y-4">

        {noTests ? (
          /* No tests completed yet */
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-nafees-cream-dark/30">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-nafees-navy font-bold mb-2">لم تُكمل أي اختبار بعد</p>
            <p className="text-nafees-warm text-sm leading-relaxed">
              أكمل الاختبارات الثلاثة (الشخصية · التعلق · المخططات) لتفعيل محرك التوليف النفسي وتحليل التقاطعات بين أبعاد شخصيتك.
            </p>
            <button
              onClick={onHome}
              className="mt-4 bg-nafees-navy text-nafees-cream text-sm font-semibold px-6 py-2.5 rounded-full active:scale-95 transition-all"
            >
              ابدأ من هنا
            </button>
          </div>
        ) : (
          <>
            {/* Persona Dimensions */}
            <div>
              <h2 className="text-sm font-bold text-nafees-navy mb-3 px-1">الأبعاد النفسية المركّبة</h2>
              <div className="space-y-3">
                {result.dimensions.map((dim) => (
                  <DimensionCard key={dim.id} dim={dim} />
                ))}
              </div>
            </div>

            {/* Key Insights */}
            {result.keyInsights.length > 0 && (
              <div className="bg-nafees-navy/5 rounded-2xl p-4 border border-nafees-navy/10">
                <h2 className="text-sm font-bold text-nafees-navy mb-3">✦ رؤى جوهرية</h2>
                <ul className="space-y-2">
                  {result.keyInsights.map((insight, i) => (
                    <li key={i} className="flex gap-2 text-xs text-nafees-warm-dark leading-relaxed">
                      <span className="text-nafees-copper flex-shrink-0">◆</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Primary Narrative */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-nafees-cream-dark/30">
              <h2 className="text-sm font-bold text-nafees-navy mb-3">التحليل التوليفي</h2>
              <p className="text-sm text-nafees-warm-dark leading-loose">{result.primaryNarrative}</p>
            </div>

            {/* Scientific basis */}
            <div className="bg-nafees-cream-dark/30 rounded-2xl p-4">
              <h2 className="text-xs font-bold text-nafees-navy mb-2">المصادر العلمية</h2>
              <div className="space-y-1 text-[10px] text-nafees-warm leading-relaxed">
                <p>• Noftle & Shaver (2006). Attachment dimensions and the Big Five. J. Research in Personality, 40(2), 179–208.</p>
                <p>• Thimm (2010). Personality and early maladaptive schemas. J. Behavior Therapy & Experimental Psychiatry, 41(4), 373–380.</p>
                <p>• Mikulincer & Shaver (2007). Attachment in Adulthood. Guilford Press.</p>
                <p>• Barrick & Mount (1991). Big Five and job performance. Personnel Psychology, 44(1), 1–26.</p>
                <p>• Young, Klosko & Weishaar (2003). Schema Therapy. Guilford Press.</p>
              </div>
              <p className="text-[9px] text-nafees-warm mt-2 leading-relaxed">
                جميع معاملات الترجيح مشتقة مباشرة من معاملات الارتباط المنشورة في الدراسات أعلاه. لا يوجد تخمين أو ارتجال في منهجية الحساب.
              </p>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-nafees-warm text-center px-2 leading-relaxed">
              هذا التحليل لأغراض التوعية الذاتية فقط وليس تشخيصاً سريرياً.
              للحصول على تقييم متخصص، يُرشد للتواصل مع معالج نفسي مرخص.
            </p>
          </>
        )}

        {/* Back button */}
        <button
          onClick={onHome}
          className="w-full py-3 rounded-2xl border-2 border-nafees-cream-dark text-nafees-navy font-semibold text-sm active:scale-95 transition-all"
        >
          ← العودة إلى الرئيسية
        </button>
      </div>
    </div>
  );
}
