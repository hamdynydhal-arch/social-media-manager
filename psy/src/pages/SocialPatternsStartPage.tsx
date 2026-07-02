import { useState } from 'react';
import NafeesLogo from '../components/NafeesLogo';
import { EDUCATIONAL_CARD, CONTENT } from '../data/socialPatternsContent';

interface SocialPatternsStartPageProps {
  questionCount: number;
  estimatedMinutes: number;
  onStart: () => void;
  onHome?: () => void;
}

export default function SocialPatternsStartPage({
  questionCount,
  estimatedMinutes,
  onStart,
}: SocialPatternsStartPageProps) {
  const [eduExpanded, setEduExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-nafees-cream flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-nafees-navy flex items-center justify-center shadow-lg">
              <NafeesLogo size={52} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-nafees-navy tracking-wide mb-1" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: '0.12em' }}>
            نَفيس
          </h1>
          <p className="text-nafees-warm text-sm font-medium">مختبر الشخصية النفسية</p>
        </div>

        {/* Test info card */}
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🦅🐺🕊️🌊</div>
            <div>
              <h2 className="text-xl font-bold text-nafees-navy leading-tight">اختبار الأنماط الاجتماعية</h2>
              <p className="text-xs text-nafees-warm mt-0.5">ألفا · سيغما · بيتا · دلتا</p>
            </div>
          </div>

          <p className="text-nafees-warm-dark leading-relaxed mb-5 text-sm">
            اكتشف نمطك الاجتماعي وتعرّف على الحقيقة العلمية الكامنة وراء مصطلحات ألفا وسيغما الشائعة — وكيف تتصل بشخصيتك الحقيقية.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-nafees-navy/8 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-navy">{questionCount}</div>
              <div className="text-xs text-nafees-warm mt-1">سؤالاً</div>
            </div>
            <div className="bg-nafees-navy/8 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-navy">~{estimatedMinutes}</div>
              <div className="text-xs text-nafees-warm mt-1">دقيقة</div>
            </div>
            <div className="bg-nafees-navy/8 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-navy">4</div>
              <div className="text-xs text-nafees-warm mt-1">أنماط</div>
            </div>
          </div>

          <div className="bg-nafees-navy/5 rounded-2xl p-4 mb-5">
            <h3 className="font-bold text-nafees-warm-dark mb-2 text-sm">الأبعاد المُقاسة</h3>
            <div className="grid grid-cols-2 gap-1.5 text-sm text-nafees-warm-dark">
              {[
                ['⚡', 'الهيمنة والقيادة (D)'],
                ['🧭', 'الاستقلالية (Au)'],
                ['🕊️', 'المسايرة الاجتماعية (SA)'],
                ['✨', 'الظهور والاعتراف (AS)'],
              ].map(([icon, name]) => (
                <div key={name} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="text-xs">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full font-bold py-3 px-6 rounded-2xl bg-nafees-navy hover:bg-nafees-blue text-white shadow-lg active:scale-95 transition-all text-center"
          >
            ابدأ الاختبار الآن
          </button>
        </div>

        {/* Educational card - expandable */}
        <div className="card mb-4 border border-nafees-sky/30 bg-nafees-sky/5">
          <button
            className="w-full text-right"
            onClick={() => setEduExpanded((v) => !v)}
          >
            <div className="flex items-center justify-between">
              <span className="text-nafees-blue text-lg">{eduExpanded ? '▲' : '▼'}</span>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs font-bold text-nafees-blue">💡 هل تعلم؟</p>
                  <h3 className="text-sm font-extrabold text-nafees-navy">{EDUCATIONAL_CARD.shortTitle}</h3>
                </div>
              </div>
            </div>
            {!eduExpanded && (
              <p className="text-xs text-nafees-warm mt-2 text-right leading-relaxed">
                {EDUCATIONAL_CARD.shortSnippet}
              </p>
            )}
          </button>

          {eduExpanded && (
            <div className="mt-4 space-y-4 border-t border-nafees-sky/30 pt-4">
              <h3 className="text-base font-extrabold text-nafees-navy">{EDUCATIONAL_CARD.fullTitle}</h3>
              {EDUCATIONAL_CARD.story.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-nafees-warm-dark leading-relaxed">{para}</p>
              ))}
              <div className="bg-nafees-navy/5 rounded-2xl p-4">
                <p className="text-xs text-nafees-navy leading-relaxed font-medium">
                  {EDUCATIONAL_CARD.conclusion}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="card mb-4">
          <h3 className="font-bold text-nafees-warm-dark mb-3 text-sm">نصائح للحصول على نتيجة دقيقة</h3>
          <ul className="space-y-2 text-sm text-nafees-warm-dark">
            <li className="flex gap-2"><span>✅</span><span>أجب بصدق عن كيف تتصرف فعلاً في المواقف الاجتماعية، لا كما تودّ أن تكون.</span></li>
            <li className="flex gap-2"><span>⚡</span><span>ثق بأول انطباع — إجابتك التلقائية عادةً هي الأدق.</span></li>
            <li className="flex gap-2"><span>🔒</span><span>نتائجك تُحفظ محلياً على جهازك فقط ولا تُشارَك مع أحد.</span></li>
            <li className="flex gap-2"><span>⏸️</span><span>يمكنك التوقف في أي وقت والعودة لاحقاً — تقدّمك محفوظ.</span></li>
          </ul>
        </div>

        <p className="text-xs text-nafees-warm text-center leading-relaxed px-2">
          ⚠️ {CONTENT.disclaimer}
        </p>
      </div>
    </div>
  );
}
