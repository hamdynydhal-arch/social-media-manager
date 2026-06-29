import NafeesLogo from '../components/NafeesLogo';

interface AttachmentStartPageProps {
  questionCount: number;
  estimatedMinutes: number;
  disclaimer: string;
  onStart: () => void;
  onHome: () => void;
}

export default function AttachmentStartPage({
  questionCount,
  estimatedMinutes,
  disclaimer,
  onStart,
  onHome,
}: AttachmentStartPageProps) {
  return (
    <div className="min-h-screen bg-nafees-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onHome}
            className="text-xs text-nafees-warm hover:text-nafees-blue transition-colors mb-4 block mx-auto"
          >
            → العودة للرئيسية
          </button>
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-nafees-copper flex items-center justify-center shadow-lg">
              <NafeesLogo size={52} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-nafees-copper tracking-wide mb-1" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: '0.12em' }}>
            نَفيس
          </h1>
          <p className="text-nafees-warm text-sm font-medium">مختبر الشخصية النفسية</p>
        </div>

        {/* Test info card */}
        <div className="card mb-4">
          <h2 className="text-xl font-bold text-nafees-navy mb-2">اختبار أسلوب التعلق العاطفي</h2>
          <p className="text-nafees-warm-dark leading-relaxed mb-6">
            اكتشف نمط تعلقك في العلاقات الرومانسية عبر مقياس ECR-R المُحكَّم علمياً، المبني على نظرية التعلق لجون بولبي وماري أينسورث.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-nafees-copper/10 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-copper">{questionCount}</div>
              <div className="text-xs text-nafees-warm mt-1">سؤالاً</div>
            </div>
            <div className="bg-nafees-copper/10 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-copper">~{estimatedMinutes}</div>
              <div className="text-xs text-nafees-warm mt-1">دقيقة</div>
            </div>
            <div className="bg-nafees-copper/10 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-nafees-copper">4</div>
              <div className="text-xs text-nafees-warm mt-1">أنماط</div>
            </div>
          </div>

          <div className="bg-nafees-copper/8 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-nafees-warm-dark mb-2 text-sm">ما الذي سيُقاس؟</h3>
            <div className="grid grid-cols-1 gap-1.5 text-sm text-nafees-warm-dark">
              {[
                ['😰', 'مستوى قلق التعلق (الخوف من الهجر)'],
                ['🧊', 'مستوى تجنب التعلق (النفور من القرب)'],
                ['💚', 'النمط الآمن'],
                ['💛', 'النمط القلق-المنشغل'],
                ['💙', 'النمط المتجنب-الرافض'],
                ['🧡', 'النمط المتجنب-الخائف'],
              ].map(([icon, name]) => (
                <div key={name} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full font-bold py-3 px-6 rounded-2xl bg-nafees-copper hover:bg-nafees-warm-dark text-white shadow-lg active:scale-95 transition-all text-center"
          >
            ابدأ الاختبار الآن
          </button>
        </div>

        {/* Scientific intro */}
        <div className="card mb-4 bg-nafees-copper/8 border border-nafees-copper/20">
          <p className="text-sm text-nafees-warm-dark leading-relaxed">
            <strong>💡 عن الاختبار:</strong>{' '}
            صُمم هذا الاختبار استناداً إلى نظرية التعلق (Attachment Theory) الرائدة لجون بولبي وماري أينسورث. يعتمد التقييم حرفياً على المقياس الأكاديمي المحكم: التجارب في العلاقات الوثيقة المنقح (ECR-R) للعالم (Fraley et al., 2000). يقيس هذا المقياس بُعدين أساسيين في مشاعرك (القلق والتجنب) لتحديد نمط تنظيمك العاطفي في العلاقات.
          </p>
        </div>

        {/* Tips */}
        <div className="card mb-4">
          <h3 className="font-bold text-nafees-warm-dark mb-3 text-sm">نصائح للحصول على نتيجة دقيقة</h3>
          <ul className="space-y-2 text-sm text-nafees-warm-dark">
            <li className="flex gap-2"><span>✅</span><span>أجب بصدق عن كيف أنت فعلاً، لا كما تودّ أن تكون.</span></li>
            <li className="flex gap-2"><span>💭</span><span>فكّر في علاقاتك الرومانسية الحالية أو الأخيرة عند الإجابة.</span></li>
            <li className="flex gap-2"><span>🔒</span><span>نتائجك تُحفظ محلياً على جهازك فقط، ولا تُشارَك مع أحد.</span></li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-nafees-warm text-center leading-relaxed px-2">
          ⚠️ {disclaimer}
        </p>

      </div>
    </div>
  );
}
