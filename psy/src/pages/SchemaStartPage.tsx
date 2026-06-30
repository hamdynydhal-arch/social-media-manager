import NafeesLogo from '../components/NafeesLogo';

const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

interface SchemaStartPageProps {
  questionCount: number;
  estimatedMinutes: number;
  disclaimer: string;
  onStart: () => void;
  onHome: () => void;
  onSelectSettings?: () => void;
}

export default function SchemaStartPage({
  questionCount,
  estimatedMinutes,
  disclaimer,
  onStart,
  onHome,
  onSelectSettings,
}: SchemaStartPageProps) {
  return (
    <div className="min-h-screen bg-nafees-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6" dir="rtl">
            <button
              onClick={onHome}
              className="text-xs text-nafees-warm hover:text-nafees-blue transition-colors flex items-center gap-1"
            >
              ← رجوع
            </button>
            {onSelectSettings && (
              <button onClick={onSelectSettings} className="text-nafees-warm/50 hover:text-nafees-navy active:scale-95 transition-all p-1" aria-label="الإعدادات">
                <GearIcon />
              </button>
            )}
          </div>
          <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-nafees-sage flex items-center justify-center shadow-lg">
              <NafeesLogo size={52} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-nafees-sage tracking-wide mb-1" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: '0.12em' }}>
            نَفيس
          </h1>
          <p className="text-nafees-warm text-sm font-medium">مختبر الشخصية النفسية</p>
          </div>
        </div>

        {/* Test info card */}
        <div className="card mb-4">
          <h2 className="text-xl font-bold text-nafees-navy mb-2">اختبار المخططات المعرفية وتجارب الطفولة</h2>
          <p className="text-nafees-warm-dark leading-relaxed mb-6">
            اكتشف المخططات المعرفية التي تشكّلت في طفولتك وكيف تؤثر على علاقاتك وحياتك اليوم، استناداً إلى علاج المخططات (Schema Therapy) ليانغ وكلوسكو وويشار.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-nafees-sage/15 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-sage">{questionCount}</div>
              <div className="text-xs text-nafees-warm mt-1">سؤالاً</div>
            </div>
            <div className="bg-nafees-sage/15 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-sage">~{estimatedMinutes}</div>
              <div className="text-xs text-nafees-warm mt-1">دقيقة</div>
            </div>
            <div className="bg-nafees-sage/15 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-sage">7</div>
              <div className="text-xs text-nafees-warm mt-1">مخططات</div>
            </div>
          </div>

          <div className="bg-nafees-sage/10 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-nafees-warm-dark mb-2 text-sm">المخططات السبعة المُقيَّمة</h3>
            <div className="grid grid-cols-1 gap-1.5 text-sm text-nafees-warm-dark">
              {[
                ['🌊', 'الهجر وعدم الاستقرار'],
                ['🛡️', 'عدم الثقة والانتهاك'],
                ['💧', 'الحرمان العاطفي'],
                ['🪨', 'النقص والعار'],
                ['🏝️', 'العزلة الاجتماعية والاغتراب'],
                ['🔗', 'الخضوع وإلغاء الذات'],
                ['⚖️', 'المعايير الصارمة والنقد الذاتي'],
              ].map(([icon, name]) => (
                <div key={name} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sensitivity notice */}
          <div className="bg-nafees-navy/5 border border-nafees-sky/30 rounded-2xl p-4 mb-6">
            <p className="text-xs text-nafees-navy leading-relaxed">
              <strong>ملاحظة: </strong>
              بعض الأسئلة تتناول تجارب طفولية قد تكون حساسة. أجب بالسرعة المناسبة لك، وتوقّف إن احتجتَ — نتائجك محفوظة محلياً في أي وقت.
            </p>
          </div>

          <button
            onClick={onStart}
            className="w-full font-bold py-3 px-6 rounded-2xl bg-nafees-sage hover:bg-nafees-warm-dark text-white shadow-lg active:scale-95 transition-all text-center"
          >
            ابدأ الاختبار الآن
          </button>
        </div>

        {/* Scientific intro */}
        <div className="card mb-4 bg-nafees-sage/10 border border-nafees-sage/30">
          <p className="text-sm text-nafees-warm-dark leading-relaxed">
            <strong>💡 عن الاختبار: </strong>
            يستند هذا التقييم إلى علاج المخططات المعرفية (Schema Therapy) الذي طوّره الدكتور جيفري يانغ وزملاؤه (Young, Klosko & Weishaar, 2003). يقيس الاختبار سبعة مخططات معرفية مبكرة مرتبطة بتجارب الطفولة وبيئة الأقران، مع دمج نتائج دراسة ACE التأسيسية (Felitti et al., 1998) وأبحاث التنظيم الجسدي للصدمة (Van der Kolk, 2014).
          </p>
        </div>

        {/* Tips */}
        <div className="card mb-4">
          <h3 className="font-bold text-nafees-warm-dark mb-3 text-sm">نصائح للحصول على نتيجة دقيقة</h3>
          <ul className="space-y-2 text-sm text-nafees-warm-dark">
            <li className="flex gap-2"><span>✅</span><span>أجب بصدق عن كيف تشعر فعلاً، لا كما تودّ أن تكون أو تتمنى.</span></li>
            <li className="flex gap-2"><span>🧒</span><span>لبعض الأسئلة، استرجع مشاعرك في الطفولة والمراهقة.</span></li>
            <li className="flex gap-2"><span>🔒</span><span>نتائجك تُحفظ محلياً على جهازك فقط ولا تُشارَك مع أحد.</span></li>
            <li className="flex gap-2"><span>⏸️</span><span>يمكنك التوقف في أي وقت والعودة لاحقاً — التقدم محفوظ.</span></li>
          </ul>
        </div>

        <p className="text-xs text-nafees-warm text-center leading-relaxed px-2">
          ⚠️ {disclaimer}
        </p>
      </div>
    </div>
  );
}
