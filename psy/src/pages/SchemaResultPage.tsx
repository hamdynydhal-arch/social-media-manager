import { useRef, useState } from 'react';
import type { SchemaResult, SchemaContent, SchemaKey } from '../engine/schemaTypes';
import { exportToPdf } from '../utils/exportPdf';

interface SchemaResultPageProps {
  result: SchemaResult;
  content: SchemaContent;
  onRetake: () => void;
  onHome: () => void;
}

const SCHEMA_ORDER: SchemaKey[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];

export default function SchemaResultPage({ result, content, onRetake, onHome }: SchemaResultPageProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [showRefs, setShowRefs] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [expandedSchema, setExpandedSchema] = useState<SchemaKey | null>(
    result.activeSchemas[0] ?? null,
  );

  const mode = content.modes[result.mode];
  const primarySchema = content.schemas[result.primarySchema];

  async function handleDownloadPdf() {
    if (!reportRef.current || pdfLoading) return;
    setShowRefs(true);
    const prev = expandedSchema;
    // Expand all active schemas for PDF
    setPdfLoading(true);
    await new Promise<void>((r) => setTimeout(r, 150));
    try {
      await exportToPdf(reportRef.current, `psy-مخططات-${result.mode}.pdf`);
    } finally {
      setPdfLoading(false);
      setExpandedSchema(prev);
    }
  }

  function SchemaBar({ schemaKey }: { schemaKey: SchemaKey }) {
    const sc = content.schemas[schemaKey];
    const pct = Math.round(result.percentages[schemaKey]);
    const isActive = result.activeSchemas.includes(schemaKey);
    const isPrimary = result.primarySchema === schemaKey;

    return (
      <div className={`rounded-2xl p-3 ${isActive ? 'bg-nafees-sage/10 border border-nafees-sage/30' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{sc.icon}</span>
            <span className={`text-xs font-bold ${isActive ? 'text-nafees-warm-dark' : 'text-gray-500'}`}>
              {sc.shortName}
            </span>
            {isPrimary && (
              <span className="bg-nafees-sage text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">الأقوى</span>
            )}
          </div>
          <span className={`text-xs font-bold ${isActive ? 'text-nafees-sage' : 'text-gray-400'}`}>{pct}٪</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isActive ? sc.barColor : 'bg-gray-300'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  function ActiveSchemaCard({ schemaKey }: { schemaKey: SchemaKey }) {
    const sc = content.schemas[schemaKey];
    const isExpanded = expandedSchema === schemaKey;

    return (
      <div className="card border border-amber-100">
        <button
          className="w-full text-right"
          onClick={() => setExpandedSchema(isExpanded ? null : schemaKey)}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-lg">{isExpanded ? '▲' : '▼'}</span>
            <div className="flex items-center gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-gray-800">{sc.name}</h3>
                <p className="text-xs text-nafees-sage">{Math.round(result.percentages[schemaKey])}٪ · الحاجة الأساسية: {sc.coreNeed}</p>
              </div>
              <span className="text-2xl">{sc.icon}</span>
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4 border-t border-nafees-sage/20 pt-4">

            {/* Description */}
            <div className="bg-nafees-sage/10 rounded-2xl p-4">
              <p className="text-sm text-nafees-warm-dark leading-relaxed">{sc.description}</p>
            </div>

            {/* Childhood origin */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                <span>🧒</span> الجذر الطفولي
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{sc.childhoodOrigin}</p>
            </div>

            {/* Triggers */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                <span>⚡</span> محفّزاته في الحياة الحالية
              </h4>
              <ul className="space-y-1">
                {sc.adultTriggers.map((t, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-nafees-sage flex-shrink-0">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths & Challenges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-2xl p-3">
                <h4 className="text-xs font-bold text-emerald-700 mb-2">✦ نقاط القوة</h4>
                <ul className="space-y-1">
                  {sc.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-emerald-800 flex gap-1">
                      <span className="flex-shrink-0 text-emerald-500">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 rounded-2xl p-3">
                <h4 className="text-xs font-bold text-red-700 mb-2">✦ التحديات</h4>
                <ul className="space-y-1">
                  {sc.challenges.map((c, i) => (
                    <li key={i} className="text-xs text-red-800 flex gap-1">
                      <span className="flex-shrink-0 text-red-400">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Somatic */}
            <div className="bg-blue-50 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                <span>🫁</span> التنظيم الجسدي (Somatic Regulation)
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">{sc.somatic}</p>
            </div>

            {/* Mindfulness */}
            <div className="bg-purple-50 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-purple-700 mb-2 flex items-center gap-1">
                <span>🧘</span> تمرين اليقظة الذهنية (Mindfulness)
              </h4>
              <p className="text-sm text-purple-800 leading-relaxed">{sc.mindfulness}</p>
            </div>

            {/* Therapy note */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                <span>🛋️</span> ملاحظة علاجية
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{sc.therapyNote}</p>
            </div>

            {/* Growth */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                <span>🌱</span> خطوات نحو الشفاء
              </h4>
              <ul className="space-y-2">
                {sc.growth.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                    <span className="text-nafees-copper font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nafees-cream pb-12">

      {/* Screen-only header */}
      <div className={`bg-gradient-to-l ${primarySchema.gradientFrom} ${primarySchema.gradientTo} text-white px-4 pt-10 pb-8 relative`}>
        <div className="max-w-md mx-auto text-center">
          <button
            onClick={onHome}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-sm transition-colors"
          >
            → الرئيسية
          </button>
          <div className="text-6xl mb-3">{mode.icon}</div>
          <h1 className="text-2xl font-extrabold mb-1">{mode.name}</h1>
          <p className="text-white/80 text-sm">
            {result.activeSchemas.length > 0
              ? `${result.activeSchemas.length} مخطط${result.activeSchemas.length === 1 ? '' : 'ات'} نشطة`
              : 'مخططات في المستوى الطبيعي'}
          </p>
        </div>
      </div>

      {/* PDF-capturable content */}
      <div ref={reportRef} className="max-w-md mx-auto px-4 pt-6 space-y-5">

        {/* PDF header */}
        <div className={`bg-gradient-to-l ${primarySchema.gradientFrom} ${primarySchema.gradientTo} rounded-3xl p-5 text-white text-center`}>
          <div className="text-4xl mb-2">{mode.icon}</div>
          <p className="text-xs text-white/70 mb-1">نفيس · اختبار المخططات المعرفية وتجارب الطفولة</p>
          <h2 className="text-xl font-extrabold mb-0.5">{mode.name}</h2>
          <p className="text-white/80 text-sm">
            {result.activeSchemas.length > 0
              ? `المخطط الأقوى: ${content.schemas[result.primarySchema].name}`
              : 'مخططات في المستوى الطبيعي'}
          </p>
        </div>

        {/* Mode description */}
        <div className="bg-nafees-sage/10 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">{mode.icon}</span>
            <p className="text-sm text-nafees-warm-dark leading-relaxed">{mode.description}</p>
          </div>
        </div>

        {/* Schema bars */}
        <div className="card">
          <h2 className="text-sm font-bold text-gray-700 mb-4">درجاتك على المخططات السبعة</h2>
          <div className="space-y-3">
            {SCHEMA_ORDER.map((key) => (
              <SchemaBar key={key} schemaKey={key} />
            ))}
          </div>
          {result.activeSchemas.length > 0 && (
            <p className="text-xs text-nafees-sage mt-3 text-center font-medium">
              المخططات النشطة (≥ 58٪) تحمل ألواناً مميزة وتستحق المراجعة الأعمق
            </p>
          )}
        </div>

        {/* Active schemas - detailed */}
        {result.activeSchemas.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-700 text-center">
              تحليل مخططاتك النشطة
            </h2>
            {result.activeSchemas.map((key) => (
              <ActiveSchemaCard key={key} schemaKey={key} />
            ))}
          </div>
        ) : (
          <div className="card border border-emerald-100 bg-emerald-50/50">
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-bold text-emerald-800 mb-2">مخططاتك في المستوى الصحي</h3>
              <p className="text-sm text-emerald-700 leading-relaxed">
                لم تتجاوز مخططاتك العتبة النشطة. هذا يشير إلى قدرة جيدة على تلبية الاحتياجات العاطفية بطرق ناضجة ومتوازنة.
              </p>
            </div>
          </div>
        )}

        {/* Closing message */}
        <div className={`bg-gradient-to-l ${primarySchema.gradientFrom} ${primarySchema.gradientTo} rounded-3xl p-5 text-white`}>
          <p className="text-sm leading-relaxed text-center">{content.closingMessage}</p>
        </div>

        {/* Scientific summary */}
        <div className="card border border-nafees-sage/30 bg-nafees-sage/5">
          <h4 className="text-sm font-extrabold text-nafees-warm-dark mb-3">🔍 خلاصة النماذج العلمية المعتمدة</h4>
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <div>
              <strong className="text-gray-800">المخططات المعرفية المبكرة: </strong>
              يُعرّف Young, Klosko & Weishaar (2003) المخططات المعرفية المبكرة بأنها أنماط واسعة وعميقة من المعتقدات والذكريات والمشاعر والأحاسيس الجسدية التي تتشكّل في مرحلة الطفولة حين لا تُلبَّى الاحتياجات العاطفية الأساسية، وتستمر طوال الحياة مُؤثِّرةً في الإدراك والسلوك والعلاقات.
            </div>
            <div>
              <strong className="text-gray-800">تجارب الطفولة السلبية (ACE): </strong>
              أثبتت دراسة Felitti et al. (1998) التأسيسية أن التجارب السلبية في الطفولة — من خلل وظيفي أسري وإساءة وإهمال — ترتبط ارتباطاً مباشراً وقوياً بنتائج صحية ونفسية واجتماعية في مرحلة البلوغ. كلما تعددت هذه التجارب، كانت التأثيرات أعمق وأكثر استمراراً.
            </div>
            <div>
              <strong className="text-gray-800">الجسم والصدمة: </strong>
              يؤكد Van der Kolk (2014) أن الصدمة لا تُخزَّن فقط في الذاكرة الواعية، بل في الجسم ذاته. لهذا السبب، تشمل توصياتنا ممارسات التنظيم الجسدي (Somatic Regulation) واليقظة الذهنية (Mindfulness) كجزء أساسي لا اختياري من مسار الشفاء.
            </div>
            <div>
              <strong className="text-gray-800">بيئة الأقران: </strong>
              خلصت الدراسة الميتا-تحليلية لـ Reijntjes et al. (2010) إلى أن الإقصاء من الأقران والتنمر في مرحلة الطفولة يتنبأ بمشكلات نفسية داخلية مستقبلية توازي في تأثيرها مشكلات بيئة الأسرة، مع تأثير خاص في مخطط العزلة الاجتماعية.
            </div>
            <div className="border-t border-nafees-sage/30 pt-2">
              <p className="text-xs font-bold text-nafees-sage mb-1">المراجع الأساسية:</p>
              <p className="text-xs text-gray-500 leading-relaxed" dir="ltr">Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). Schema Therapy: A Practitioner's Guide. Guilford Press.</p>
              <p className="text-xs text-gray-500 leading-relaxed mt-1" dir="ltr">Felitti, V. J., et al. (1998). Relationship of Childhood Abuse and Household Dysfunction to Many of the Leading Causes of Death in Adults. American Journal of Preventive Medicine, 14(4), 245–258.</p>
              <p className="text-xs text-gray-500 leading-relaxed mt-1" dir="ltr">Van der Kolk, B. A. (2014). The Body Keeps the Score. Viking.</p>
              <p className="text-xs text-gray-500 leading-relaxed mt-1" dir="ltr">Reijntjes, A., et al. (2010). Peer victimization and internalizing problems in children: A meta-analysis. Child Abuse & Neglect, 34(4), 244–252.</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-xs text-yellow-800 leading-relaxed">
            ⚠️ <strong>تنبيه:</strong> {content.disclaimer}
          </p>
        </div>

        {/* References */}
        {showRefs && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-gray-600 mb-2">📚 المراجع العلمية</h3>
            {content.references.map((ref, i) => (
              <p key={i} className="text-xs text-gray-500 leading-relaxed" dir="ltr">{ref}</p>
            ))}
          </div>
        )}

      </div>
      {/* End PDF content */}

      {/* Screen-only controls */}
      <div className="max-w-md mx-auto px-4 mt-5 space-y-3 pb-8">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onRetake}
            className="py-3 rounded-2xl border-2 border-nafees-sage/40 text-nafees-sage font-bold text-sm hover:bg-nafees-sage/10 active:scale-95 transition-all"
          >
            🔄 إعادة
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className={`py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5
              ${pdfLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-800 text-white shadow-lg shadow-slate-200'
              }`}
          >
            {pdfLoading
              ? <><span className="animate-spin text-base">⏳</span></>
              : <><span>📄</span> PDF</>
            }
          </button>
          <button
            onClick={onHome}
            className="py-3 rounded-2xl bg-nafees-sage hover:bg-nafees-warm-dark text-white font-bold text-sm active:scale-95 transition-all"
          >
            🏠 رئيسية
          </button>
        </div>

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
