interface HomePageProps {
  onSelectOcean: () => void;
  onSelectAttachment: () => void;
}

export default function HomePage({ onSelectOcean, onSelectAttachment }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center p-4 pt-12">

      <div className="text-center mb-10">
        <div className="text-7xl mb-4">🧠</div>
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight mb-1">psy</h1>
        <p className="text-gray-500 text-sm font-medium">مختبر الشخصية النفسية</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <p className="text-center text-gray-500 text-sm mb-2">اختر الاختبار الذي تريد</p>

        {/* OCEAN / Big Five */}
        <button
          onClick={onSelectOcean}
          className="card w-full text-right hover:shadow-lg transition-all duration-200 active:scale-[0.98] block"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">🌊</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-800 mb-1">اختبار الشخصية الكبير</h3>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                اكتشف شخصيتك عبر IPIP-NEO-120 — أكثر مقاييس العوامل الخمسة الكبرى دقةً وشمولاً.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-full font-semibold">120 سؤالاً</span>
                <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-full font-semibold">~15 دقيقة</span>
                <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-full font-semibold">5 أبعاد</span>
              </div>
            </div>
            <span className="text-gray-300 text-2xl flex-shrink-0">←</span>
          </div>
        </button>

        {/* Attachment Style */}
        <button
          onClick={onSelectAttachment}
          className="card w-full text-right hover:shadow-lg transition-all duration-200 active:scale-[0.98] block"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">💞</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-800 mb-1">اختبار أسلوب التعلق العاطفي</h3>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                اكتشف نمط تعلقك في العلاقات عبر مقياس ECR-R المبني على نظرية بولبي وأينسورث.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">36 سؤالاً</span>
                <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">~10 دقائق</span>
                <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">4 أنماط</span>
              </div>
            </div>
            <span className="text-gray-300 text-2xl flex-shrink-0">←</span>
          </div>
        </button>

        <p className="text-center text-xs text-gray-400 pt-2 px-2">
          🔒 نتائجك تُحفظ محلياً على جهازك فقط ولا تُشارَك مع أحد.
        </p>
      </div>
    </div>
  );
}
