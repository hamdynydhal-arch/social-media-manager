import NafeesLogo from '../components/NafeesLogo';

interface StartPageProps {
  testName: string;
  description: string;
  estimatedMinutes: number;
  questionCount: number;
  onStart: () => void;
  onHome?: () => void;
  disclaimer: string;
}

export default function StartPage({ testName, description, estimatedMinutes, questionCount, onStart, disclaimer }: StartPageProps) {
  return (
    <div className="min-h-screen bg-nafees-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-nafees-navy flex items-center justify-center shadow-lg">
              <NafeesLogo size={52} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-nafees-blue tracking-wide mb-1" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: '0.12em' }}>
            نَفيس
          </h1>
          <p className="text-nafees-warm text-sm font-medium">مختبر الشخصية النفسية</p>
          </div>
        </div>

        {/* Card */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-nafees-navy mb-2">{testName}</h2>
          <p className="text-nafees-warm-dark leading-relaxed mb-6">{description}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-nafees-sky/15 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-blue">{questionCount}</div>
              <div className="text-xs text-nafees-warm mt-1">سؤالاً</div>
            </div>
            <div className="bg-nafees-sky/15 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-blue-mid">~{estimatedMinutes}</div>
              <div className="text-xs text-nafees-warm mt-1">دقيقة</div>
            </div>
            <div className="bg-nafees-sky/15 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-blue">5</div>
              <div className="text-xs text-nafees-warm mt-1">أبعاد</div>
            </div>
          </div>

          <div className="bg-nafees-navy/5 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-nafees-navy mb-2 text-sm">ما الذي سيُقاس؟</h3>
            <div className="grid grid-cols-1 gap-1.5 text-sm text-nafees-blue">
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
          <h3 className="font-bold text-nafees-warm-dark mb-3 text-sm">نصائح للحصول على نتيجة دقيقة</h3>
          <ul className="space-y-2 text-sm text-nafees-warm-dark">
            <li className="flex gap-2"><span>✅</span><span>أجب بصدق عن كيف أنت فعلاً، لا كما تودّ أن تكون.</span></li>
            <li className="flex gap-2"><span>⚡</span><span>اتبع أول إحساس يخطر لك — لا تُفكّر طويلاً في كل سؤال.</span></li>
            <li className="flex gap-2"><span>🔒</span><span>نتائجك تُحفظ محلياً على جهازك فقط، ولا تُشارَك مع أحد.</span></li>
          </ul>
        </div>

        {/* Scientific intro */}
        <div className="card mb-4 bg-nafees-navy/5 border border-nafees-sky/30">
          <p className="text-sm text-nafees-navy leading-relaxed">
            <strong>💡 عن الاختبار:</strong>{' '}
            يستند هذا التقييم إلى نموذج الخمسة الكبار (Big Five)، وهو المعيار الذهبي المعتمد في الأبحاث النفسية الأكاديمية العالمية. يعتمد تقييمنا على قاعدة بيانات عناصر الشخصية الدولية (IPIP) التي طورها العالم (Goldberg, 1999). على عكس الاختبارات الشعبية التي تضعك في قوالب جامدة، يقيس هذا النموذج سماتك على طيف متصل، مما يقدم صورة دقيقة وقابلة للتطور عن شخصيتك.
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-nafees-warm text-center leading-relaxed px-2">
          ⚠️ {disclaimer}
        </p>
      </div>
    </div>
  );
}
