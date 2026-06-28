import { useRef, useState } from 'react';
import type { TestResult, FactorKey, Level, TestContent, SubTypeContent } from '../engine/types';
import { selectProfileTitle } from '../engine/scoring';
import { exportToPdf } from '../utils/exportPdf';
import RadarChart from '../components/RadarChart';
import FactorBar from '../components/FactorBar';

interface ResultPageProps {
  result: TestResult;
  content: TestContent;
  onRetake: () => void;
}

const LEVEL_LABELS: Record<Level, string> = {
  very_high: 'مرتفع جداً',
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'منخفض',
  very_low: 'منخفض جداً',
};

const FACTOR_ORDER: FactorKey[] = ['O', 'C', 'E', 'A', 'N'];

const DOMAIN_ICONS: Record<string, string> = {
  work: '💼',
  relationships: '❤️',
  mentalHealth: '🧠',
  growth: '📈',
  habits: '🌱',
};

const DOMAIN_NAMES: Record<string, string> = {
  work: 'العمل والمسار المهني',
  relationships: 'العلاقات والتواصل',
  mentalHealth: 'الصحة النفسية والتوازن',
  growth: 'التطوّر الشخصي والتعلّم',
  habits: 'عادات يومية مقترحة',
};

export default function ResultPage({ result, content, onRetake }: ResultPageProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const profile = selectProfileTitle(result.levels, content.profileTitles);
  const subType: SubTypeContent | undefined = result.subTypeCode
    ? content.subTypes?.find((s) => s.code === result.subTypeCode)
    : undefined;

  const radarLabels: Partial<Record<FactorKey, string>> = {};
  const radarColors: Partial<Record<FactorKey, string>> = {};
  for (const key of FACTOR_ORDER) {
    radarLabels[key] = content.factors[key]?.shortName ?? key;
    radarColors[key] = content.factors[key]?.color ?? '#6366f1';
  }

  async function handleDownloadPdf() {
    if (!reportRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      await exportToPdf(reportRef.current, 'psy-نتيجة-الشخصية.pdf');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-lg mx-auto" ref={reportRef}>

        {/* Header */}
        <div className="text-center mb-2">
          <span className="text-4xl">🧠</span>
          <h1 className="text-2xl font-extrabold text-indigo-700 mt-1">psy — نتيجة اختبارك</h1>
        </div>

        {/* Sub-type / Profile Title */}
        <div className="card mb-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <div className="text-center">
            <div className="text-5xl mb-3">✨</div>
            <h2 className="text-2xl font-extrabold mb-1">{subType?.title ?? profile.title}</h2>
            <p className="text-indigo-200 text-sm font-medium mb-4">{subType?.subtitle ?? profile.subtitle}</p>
            <p className="text-white/90 leading-relaxed text-sm">{subType?.intro ?? profile.intro}</p>
          </div>
        </div>

        {/* Sub-type strengths & challenges */}
        {subType && (
          <div className="card mb-4">
            <h3 className="font-bold text-gray-700 mb-3 text-center">نمطك التفصيلي</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-50 rounded-2xl p-3">
                <h4 className="text-xs font-bold text-emerald-700 mb-2">✅ نقاط قوتك</h4>
                <ul className="space-y-1">
                  {subType.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-emerald-800 flex gap-1">
                      <span className="text-emerald-500 flex-shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-2xl p-3">
                <h4 className="text-xs font-bold text-amber-700 mb-2">⚡ تحديات محتملة</h4>
                <ul className="space-y-1">
                  {subType.challenges.map((c, i) => (
                    <li key={i} className="text-xs text-amber-800 flex gap-1">
                      <span className="text-amber-500 flex-shrink-0">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">توصيات مخصّصة لنمطك</h4>
            <div className="space-y-2">
              {(Object.keys(DOMAIN_ICONS) as (keyof typeof subType.recommendations)[]).map((domain) => (
                <div key={domain} className="bg-gray-50 rounded-2xl p-3 flex gap-2 items-start">
                  <span className="text-lg flex-shrink-0">{DOMAIN_ICONS[domain]}</span>
                  <div>
                    <span className="text-xs font-bold text-gray-700">{DOMAIN_NAMES[domain]}</span>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {subType.recommendations[domain]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Radar Chart */}
        <div className="card mb-4">
          <h3 className="font-bold text-gray-700 mb-4 text-center">ملف شخصيتك — نظرة عامة</h3>
          <RadarChart scores={result.scores} labels={radarLabels} colors={radarColors} />
        </div>

        {/* Factor Bars */}
        <div className="card mb-4">
          <h3 className="font-bold text-gray-700 mb-4">مستوى كل بُعد</h3>
          <div className="space-y-4">
            {FACTOR_ORDER.map((key) => {
              const fc = content.factors[key];
              const score = result.scores[key] ?? 0;
              const level = result.levels[key] ?? 'medium';
              if (!fc) return null;
              return (
                <FactorBar
                  key={key}
                  name={fc.name}
                  shortName={fc.shortName}
                  icon={fc.icon}
                  color={fc.color}
                  score={score}
                  level={level}
                />
              );
            })}
          </div>
        </div>

        {/* Per-Factor Detail */}
        {FACTOR_ORDER.map((key) => {
          const fc = content.factors[key];
          const level = result.levels[key] ?? 'medium';
          const score = result.scores[key] ?? 0;
          if (!fc) return null;
          const lc = fc.levels[level];

          return (
            <div key={key} className="card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{fc.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{fc.name}</h3>
                  <span className="text-xs text-gray-500">{Math.round(score)}% — {LEVEL_LABELS[level]}</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed text-sm mb-4">{lc.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 rounded-2xl p-3">
                  <h4 className="text-xs font-bold text-emerald-700 mb-2">✅ نقاط قوتك</h4>
                  <ul className="space-y-1">
                    {lc.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-emerald-800 flex gap-1">
                        <span className="text-emerald-500 flex-shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-2xl p-3">
                  <h4 className="text-xs font-bold text-amber-700 mb-2">⚡ تحديات محتملة</h4>
                  <ul className="space-y-1">
                    {lc.challenges.map((c, i) => (
                      <li key={i} className="text-xs text-amber-800 flex gap-1">
                        <span className="text-amber-500 flex-shrink-0">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <h4 className="text-sm font-bold text-gray-700 mb-2">توصيات مخصّصة لك</h4>
              <div className="space-y-2">
                {(Object.keys(DOMAIN_ICONS) as (keyof typeof lc.recommendations)[]).map((domain) => (
                  <div key={domain} className="bg-gray-50 rounded-2xl p-3 flex gap-2 items-start">
                    <span className="text-lg flex-shrink-0">{DOMAIN_ICONS[domain]}</span>
                    <div>
                      <span className="text-xs font-bold text-gray-700">{DOMAIN_NAMES[domain]}</span>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {lc.recommendations[domain]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Closing Message */}
        <div className="card mb-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-indigo-100">
          <div className="text-center">
            <div className="text-3xl mb-2">🌱</div>
            <p className="text-gray-700 leading-relaxed text-sm">{content.closingMessage}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-xs text-yellow-800 leading-relaxed">
            ⚠️ <strong>تنبيه مهم:</strong> {content.disclaimer}
          </p>
        </div>

        {/* Scientific References */}
        {content.references && content.references.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
            <h4 className="text-xs font-bold text-gray-600 mb-2">📚 المراجع العلمية</h4>
            <ul className="space-y-1">
              {content.references.map((ref, i) => (
                <li key={i} className="text-xs text-gray-500 leading-relaxed">{ref}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pb-8">
          <button onClick={onRetake} className="btn-secondary flex-1 text-center">
            🔄 إعادة الاختبار
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className={`
              flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-2xl
              transition-all duration-200 active:scale-95
              ${pdfLoading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-800 text-white shadow-lg shadow-slate-200'
              }
            `}
          >
            {pdfLoading ? (
              <><span className="animate-spin">⏳</span> جارٍ التوليد...</>
            ) : (
              <><span>📄</span> تحميل PDF</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
