export type RomanticTier = 'core' | 'deep';

interface RomanticTierModalProps {
  onSelect: (tier: RomanticTier) => void;
  onCancel: () => void;
}

export default function RomanticTierModal({ onSelect, onCancel }: RomanticTierModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-nafees-cream rounded-t-3xl shadow-2xl pb-10"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-10 h-1 bg-nafees-cream-dark rounded-full" />
        </div>

        <div className="px-5">
          <h3 className="text-lg font-bold text-nafees-navy mb-1 text-center">اختر عمق التقييم العاطفي</h3>
          <p className="text-xs text-nafees-warm text-center mb-5 leading-relaxed">
            كلا المستويين يكشفان شيفرتك العاطفية عبر ستة أبعاد مُرتكزة على بحوث تشابمان وستيرنبرغ
          </p>

          <button
            onClick={() => onSelect('core')}
            className="w-full bg-white border-2 border-rose-200 hover:border-rose-400 rounded-2xl p-5 mb-3 text-right active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-2xl">
                💌
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-nafees-navy mb-1">الشيفرة الأساسية</h4>
                <p className="text-xs text-nafees-warm leading-relaxed mb-3">
                  30 سؤالاً تكشف لغتك الأولى في الحب وأسلوبك العاطفي الأساسي — مثالية لاستكشاف أولي سريع.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">30 سؤالاً</span>
                  <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">~8 دقائق</span>
                  <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">6 أبعاد</span>
                </div>
              </div>
              <span className="text-nafees-cream-dark text-2xl flex-shrink-0">←</span>
            </div>
          </button>

          <button
            onClick={() => onSelect('deep')}
            className="w-full bg-nafees-navy rounded-2xl p-5 mb-4 text-right active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 text-2xl">
                🔍
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-nafees-cream mb-1">الشيفرة المعمّقة</h4>
                <p className="text-xs text-nafees-sky/80 leading-relaxed mb-3">
                  70 سؤالاً — التحليل الكامل لنمطك الرومانسي: لغتك العاطفية، شريانات الشغف، حاجات الأمان، وأسلوب الحميمية.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">70 سؤالاً</span>
                  <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">~18 دقيقة</span>
                  <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">تحليل معمّق</span>
                </div>
              </div>
              <span className="text-nafees-sky/60 text-2xl flex-shrink-0">←</span>
            </div>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-3 rounded-2xl border border-nafees-cream-dark/60 text-nafees-navy text-sm font-semibold active:scale-95 transition-transform duration-150"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
