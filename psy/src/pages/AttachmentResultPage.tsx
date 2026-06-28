import { useState } from 'react';
import type { AttachmentResult } from '../engine/attachmentTypes';
import type { AttachmentContent } from '../engine/attachmentTypes';

interface AttachmentResultPageProps {
  result: AttachmentResult;
  content: AttachmentContent;
  onRetake: () => void;
  onHome: () => void;
}

export default function AttachmentResultPage({ result, content, onRetake, onHome }: AttachmentResultPageProps) {
  const [showRefs, setShowRefs] = useState(false);
  const pattern = content.patterns[result.pattern];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 pb-12">

      {/* Header */}
      <div className={`bg-gradient-to-l ${pattern.gradientFrom} ${pattern.gradientTo} text-white px-4 pt-10 pb-8`}>
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

      <div className="max-w-md mx-auto px-4 space-y-5 mt-6">

        {/* Axis Bars */}
        <div className="card">
          <h2 className="text-sm font-bold text-gray-700 mb-4">درجاتك على المحورين</h2>

          <div className="space-y-4">
            {/* Anxiety */}
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

            {/* Avoidance */}
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

        {/* Pattern quadrant hint */}
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

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onRetake}
            className="flex-1 py-3 rounded-2xl border-2 border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 active:scale-95 transition-all"
          >
            🔄 إعادة الاختبار
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm active:scale-95 transition-all"
          >
            🏠 الرئيسية
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
          ⚠️ {content.disclaimer}
        </p>

        {/* References toggle */}
        <button
          onClick={() => setShowRefs((v) => !v)}
          className="text-xs text-gray-400 underline w-full text-center"
        >
          {showRefs ? 'إخفاء المراجع العلمية' : 'عرض المراجع العلمية'}
        </button>

        {showRefs && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-gray-600 mb-2">المراجع</h3>
            {content.references.map((ref, i) => (
              <p key={i} className="text-xs text-gray-500 leading-relaxed" dir="ltr">
                {ref}
              </p>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
