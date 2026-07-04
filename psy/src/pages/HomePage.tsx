import NafeesLogo from '../components/NafeesLogo';

interface HomePageProps {
  onSelectOcean: () => void;
  onSelectAttachment: () => void;
  onSelectSchema: () => void;
  onSelectSocialPatterns: () => void;
  onSelectRomantic: () => void;
  onSelectSynthesis: () => void;
  onSelectSettings: () => void;
  onSelectIntake: () => void;
}

export default function HomePage({ onSelectOcean, onSelectAttachment, onSelectSchema, onSelectSocialPatterns, onSelectRomantic, onSelectSynthesis, onSelectSettings, onSelectIntake }: HomePageProps) {
  return (
    <div className="min-h-screen bg-nafees-cream flex flex-col items-center">

      {/* Dark navy header */}
      <div className="w-full bg-nafees-navy text-center px-4 pt-6 pb-10 rounded-b-[2.5rem]" dir="rtl">
        <div className="flex justify-center mb-3">
          <NafeesLogo size={72} />
        </div>
        <h1 className="text-4xl font-bold text-nafees-cream tracking-widest mb-1" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: '0.15em' }}>
          نَفيس
        </h1>
        <p className="text-nafees-sky text-sm font-medium">مختبر الشخصية النفسية</p>
      </div>

      <div className="w-full max-w-md space-y-4 px-4 pt-8 pb-8">
        <p className="text-center text-nafees-warm text-sm mb-2">اختر الاختبار الذي تريد</p>

        {/* OCEAN / Big Five */}
        <button
          onClick={onSelectOcean}
          className="w-full text-right hover:shadow-lg transition-all duration-200 active:scale-[0.98] bg-white rounded-3xl border border-nafees-cream-dark/40 p-6 block shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-nafees-navy flex items-center justify-center flex-shrink-0">
              <NafeesLogo size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-nafees-navy mb-1">اختبار الشخصية الكبير</h3>
              <p className="text-sm text-nafees-warm mb-3 leading-relaxed">
                اكتشف شخصيتك عبر IPIP-NEO-120 — أكثر مقاييس العوامل الخمسة الكبرى دقةً وشمولاً.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-nafees-sky/20 text-nafees-blue text-xs px-2.5 py-1 rounded-full font-semibold">120 سؤالاً</span>
                <span className="bg-nafees-sky/20 text-nafees-blue text-xs px-2.5 py-1 rounded-full font-semibold">~15 دقيقة</span>
                <span className="bg-nafees-sky/20 text-nafees-blue text-xs px-2.5 py-1 rounded-full font-semibold">5 أبعاد</span>
              </div>
            </div>
            <span className="text-nafees-cream-dark text-2xl flex-shrink-0">←</span>
          </div>
        </button>

        {/* Attachment Style */}
        <button
          onClick={onSelectAttachment}
          className="w-full text-right hover:shadow-lg transition-all duration-200 active:scale-[0.98] bg-white rounded-3xl border border-nafees-cream-dark/40 p-6 block shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-nafees-copper flex items-center justify-center flex-shrink-0">
              <NafeesLogo size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-nafees-navy mb-1">اختبار أسلوب التعلق العاطفي</h3>
              <p className="text-sm text-nafees-warm mb-3 leading-relaxed">
                اكتشف نمط تعلقك في العلاقات عبر مقياس ECR-R المبني على نظرية بولبي وأينسورث.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-nafees-copper/10 text-nafees-copper text-xs px-2.5 py-1 rounded-full font-semibold">36 – 72 سؤالاً</span>
                <span className="bg-nafees-copper/10 text-nafees-copper text-xs px-2.5 py-1 rounded-full font-semibold">10 – 18 دقيقة</span>
                <span className="bg-nafees-copper/10 text-nafees-copper text-xs px-2.5 py-1 rounded-full font-semibold">مستويان</span>
              </div>
            </div>
            <span className="text-nafees-cream-dark text-2xl flex-shrink-0">←</span>
          </div>
        </button>

        {/* Schema / Childhood */}
        <button
          onClick={onSelectSchema}
          className="w-full text-right hover:shadow-lg transition-all duration-200 active:scale-[0.98] bg-white rounded-3xl border border-nafees-cream-dark/40 p-6 block shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-nafees-sage flex items-center justify-center flex-shrink-0">
              <NafeesLogo size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-nafees-navy mb-1">اختبار المخططات المعرفية وتجارب الطفولة</h3>
              <p className="text-sm text-nafees-warm mb-3 leading-relaxed">
                اكتشف المخططات التي شكّلتها طفولتك وكيف تؤثر على علاقاتك اليوم — مبني على علاج المخططات (Schema Therapy).
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-nafees-sage/15 text-nafees-sage text-xs px-2.5 py-1 rounded-full font-semibold">49 – 98 سؤالاً</span>
                <span className="bg-nafees-sage/15 text-nafees-sage text-xs px-2.5 py-1 rounded-full font-semibold">12 – 20 دقيقة</span>
                <span className="bg-nafees-sage/15 text-nafees-sage text-xs px-2.5 py-1 rounded-full font-semibold">مستويان</span>
              </div>
            </div>
            <span className="text-nafees-cream-dark text-2xl flex-shrink-0">←</span>
          </div>
        </button>

        {/* Social Patterns */}
        <button
          onClick={onSelectSocialPatterns}
          className="w-full text-right hover:shadow-lg transition-all duration-200 active:scale-[0.98] bg-white rounded-3xl border border-nafees-cream-dark/40 p-6 block shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-nafees-navy flex items-center justify-center flex-shrink-0 text-2xl">
              🐺
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-nafees-navy mb-1">اختبار الأنماط الاجتماعية</h3>
              <p className="text-sm text-nafees-warm mb-3 leading-relaxed">
                اكتشف نمطك الاجتماعي (ألفا، سيغما، بيتا، دلتا) وتعرّف على الحقيقة العلمية وراء هذه المصطلحات الشائعة.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-nafees-navy/8 text-nafees-navy text-xs px-2.5 py-1 rounded-full font-semibold">49 – 98 سؤالاً</span>
                <span className="bg-nafees-navy/8 text-nafees-navy text-xs px-2.5 py-1 rounded-full font-semibold">10 – 20 دقيقة</span>
                <span className="bg-nafees-navy/8 text-nafees-navy text-xs px-2.5 py-1 rounded-full font-semibold">مستويان</span>
              </div>
            </div>
            <span className="text-nafees-cream-dark text-2xl flex-shrink-0">←</span>
          </div>
        </button>

        {/* Romantic & Intimacy Code */}
        <button
          onClick={onSelectRomantic}
          className="w-full text-right hover:shadow-lg transition-all duration-200 active:scale-[0.98] bg-white rounded-3xl border border-rose-200/60 p-6 block shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl" style={{ background: 'linear-gradient(135deg, #BE185D, #881337)' }}>
              💌
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-nafees-navy mb-1">مقياس الشيفرة العاطفية والحميمية</h3>
              <p className="text-sm text-nafees-warm mb-3 leading-relaxed">
                اكتشف لغتك في الحب ونمطك الرومانسي — مبني على نظريتَي تشابمان في لغات الحب وستيرنبرغ في المثلث العاطفي.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">30 – 70 سؤالاً</span>
                <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">8 – 18 دقيقة</span>
                <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">6 أبعاد</span>
              </div>
            </div>
            <span className="text-nafees-cream-dark text-2xl flex-shrink-0">←</span>
          </div>
        </button>

        {/* Synthesis Engine */}
        <button
          onClick={onSelectSynthesis}
          className="w-full text-right hover:shadow-lg transition-all duration-200 active:scale-[0.98] bg-nafees-navy rounded-3xl border border-nafees-navy p-6 block shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 text-2xl">
              🧬
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-nafees-cream mb-1">محرك التوليف النفسي</h3>
              <p className="text-sm text-nafees-sky/80 mb-3 leading-relaxed">
                تحليل تقاطعي يدمج نتائج الاختبارات الثلاثة في صورة نفسية موحدة — مبني على معادلات الارتباط الموثقة في الأدبيات العلمية.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">5 أبعاد مركبة</span>
                <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">مصادر موثقة</span>
                <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">تقاطع 4 اختبارات</span>
              </div>
            </div>
            <span className="text-nafees-sky/60 text-2xl flex-shrink-0">←</span>
          </div>
        </button>

        <p className="text-center text-xs text-nafees-warm pt-2 px-2">
          🔒 نتائجك تُحفظ محلياً على جهازك فقط ولا تُشارَك مع أحد.
        </p>
      </div>
    </div>
  );
}
