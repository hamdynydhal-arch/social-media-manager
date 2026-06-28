interface SchemaStartPageProps {
  questionCount: number;
  estimatedMinutes: number;
  disclaimer: string;
  onStart: () => void;
  onHome: () => void;
}

export default function SchemaStartPage({
  questionCount,
  estimatedMinutes,
  disclaimer,
  onStart,
  onHome,
}: SchemaStartPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onHome}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-4 block mx-auto"
          >
            → العودة للرئيسية
          </button>
          <div className="text-7xl mb-4">🧒</div>
          <h1 className="text-4xl font-extrabold text-amber-600 tracking-tight mb-1">psy</h1>
          <p className="text-gray-500 text-sm font-medium">مختبر الشخصية النفسية</p>
        </div>

        {/* Test info card */}
        <div className="card mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">اختبار المخططات المعرفية وتجارب الطفولة</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            اكتشف المخططات المعرفية التي تشكّلت في طفولتك وكيف تؤثر على علاقاتك وحياتك اليوم، استناداً إلى علاج المخططات (Schema Therapy) ليانغ وكلوسكو وويشار.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-amber-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{questionCount}</div>
              <div className="text-xs text-gray-500 mt-1">سؤالاً</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">~{estimatedMinutes}</div>
              <div className="text-xs text-gray-500 mt-1">دقيقة</div>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">7</div>
              <div className="text-xs text-gray-500 mt-1">مخططات</div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-amber-800 mb-2 text-sm">المخططات السبعة المُقيَّمة</h3>
            <div className="grid grid-cols-1 gap-1.5 text-sm text-amber-700">
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
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>ملاحظة: </strong>
              بعض الأسئلة تتناول تجارب طفولية قد تكون حساسة. أجب بالسرعة المناسبة لك، وتوقّف إن احتجتَ — نتائجك محفوظة محلياً في أي وقت.
            </p>
          </div>

          <button
            onClick={onStart}
            className="w-full font-bold py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-100 active:scale-95 transition-all text-center"
          >
            ابدأ الاختبار الآن
          </button>
        </div>

        {/* Scientific intro */}
        <div className="card mb-4 bg-amber-50 border border-amber-100">
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>💡 عن الاختبار: </strong>
            يستند هذا التقييم إلى علاج المخططات المعرفية (Schema Therapy) الذي طوّره الدكتور جيفري يانغ وزملاؤه (Young, Klosko & Weishaar, 2003). يقيس الاختبار سبعة مخططات معرفية مبكرة مرتبطة بتجارب الطفولة وبيئة الأقران، مع دمج نتائج دراسة ACE التأسيسية (Felitti et al., 1998) وأبحاث التنظيم الجسدي للصدمة (Van der Kolk, 2014).
          </p>
        </div>

        {/* Tips */}
        <div className="card mb-4">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">نصائح للحصول على نتيجة دقيقة</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2"><span>✅</span><span>أجب بصدق عن كيف تشعر فعلاً، لا كما تودّ أن تكون أو تتمنى.</span></li>
            <li className="flex gap-2"><span>🧒</span><span>لبعض الأسئلة، استرجع مشاعرك في الطفولة والمراهقة.</span></li>
            <li className="flex gap-2"><span>🔒</span><span>نتائجك تُحفظ محلياً على جهازك فقط ولا تُشارَك مع أحد.</span></li>
            <li className="flex gap-2"><span>⏸️</span><span>يمكنك التوقف في أي وقت والعودة لاحقاً — التقدم محفوظ.</span></li>
          </ul>
        </div>

        <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
          ⚠️ {disclaimer}
        </p>
      </div>
    </div>
  );
}
