interface StartPageProps {
  testName: string;
  description: string;
  estimatedMinutes: number;
  questionCount: number;
  onStart: () => void;
  onHome?: () => void;
  disclaimer: string;
}

export default function StartPage({ testName, description, estimatedMinutes, questionCount, onStart, onHome, disclaimer }: StartPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          {onHome && (
            <button
              onClick={onHome}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-4 block mx-auto"
            >
              → العودة للرئيسية
            </button>
          )}
          <div className="text-7xl mb-4">🧠</div>
          <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight mb-1">psy</h1>
          <p className="text-gray-500 text-sm font-medium">مختبر الشخصية النفسية</p>
        </div>

        {/* Card */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{testName}</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-indigo-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600">{questionCount}</div>
              <div className="text-xs text-gray-500 mt-1">سؤالاً</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">~{estimatedMinutes}</div>
              <div className="text-xs text-gray-500 mt-1">دقيقة</div>
            </div>
            <div className="bg-pink-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-pink-600">5</div>
              <div className="text-xs text-gray-500 mt-1">أبعاد</div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-2 text-sm">ما الذي سيُقاس؟</h3>
            <div className="grid grid-cols-1 gap-1.5 text-sm text-blue-700">
              {[
                ['🌟', 'الانبساط'],
                ['❤️', 'الوُد والمقبولية'],
                ['🎯', 'يقظة الضمير'],
                ['⚖️', 'الاستقرار الانفعالي'],
                ['🔭', 'الانفتاح على الخبرة'],
              ].map(([icon, name]) => (
                <div key={name} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onStart} className="btn-primary w-full text-center">
            ابدأ الاختبار الآن
          </button>
        </div>

        {/* Tips */}
        <div className="card mb-4">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">نصائح للحصول على نتيجة دقيقة</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2"><span>✅</span><span>أجب بصدق عن كيف أنت فعلاً، لا كما تودّ أن تكون.</span></li>
            <li className="flex gap-2"><span>⚡</span><span>اتبع أول إحساس يخطر لك — لا تُفكّر طويلاً في كل سؤال.</span></li>
            <li className="flex gap-2"><span>🔒</span><span>نتائجك تُحفظ محلياً على جهازك فقط، ولا تُشارَك مع أحد.</span></li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
          ⚠️ {disclaimer}
        </p>
      </div>
    </div>
  );
}
