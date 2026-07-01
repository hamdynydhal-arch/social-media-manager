import type { OceanTier } from '../engine/types';

interface OceanTierModalProps {
  onSelect: (tier: OceanTier) => void;
  onCancel: () => void;
}

export default function OceanTierModal({ onSelect, onCancel }: OceanTierModalProps) {
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
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-10 h-1 bg-nafees-cream-dark rounded-full" />
        </div>

        <div className="px-5">
          <h3 className="text-lg font-bold text-nafees-navy mb-1 text-center">اختر مستوى التقييم</h3>
          <p className="text-xs text-nafees-warm text-center mb-5 leading-relaxed">
            كلا المستويين يُنتجان نتائج علمية دقيقة على أبعاد الشخصية الخمسة
          </p>

          {/* Core Tier */}
          <button
            onClick={() => onSelect('core')}
            className="w-full bg-white border-2 border-nafees-sky/40 hover:border-nafees-blue rounded-2xl p-5 mb-3 text-right active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-nafees-sky/20 flex items-center justify-center flex-shrink-0 text-2xl">
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-nafees-navy mb-1">التقييم الأساسي</h4>
                <p className="text-xs text-nafees-warm leading-relaxed mb-3">
                  50 سؤالاً بأعلى درجة دلالة — يغطي جميع الأبعاد الخمسة الكبرى بدقة.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-nafees-sky/20 text-nafees-blue text-xs px-2.5 py-1 rounded-full font-semibold">50 سؤالاً</span>
                  <span className="bg-nafees-sky/20 text-nafees-blue text-xs px-2.5 py-1 rounded-full font-semibold">~6 دقائق</span>
                  <span className="bg-nafees-sky/20 text-nafees-blue text-xs px-2.5 py-1 rounded-full font-semibold">5 أبعاد</span>
                </div>
              </div>
              <span className="text-nafees-cream-dark text-2xl flex-shrink-0">←</span>
            </div>
          </button>

          {/* Deep Tier */}
          <button
            onClick={() => onSelect('deep')}
            className="w-full bg-nafees-navy rounded-2xl p-5 mb-4 text-right active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 text-2xl">
                🔬
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-nafees-cream mb-1">التقييم الشامل</h4>
                <p className="text-xs text-nafees-sky/80 leading-relaxed mb-3">
                  120 سؤالاً — النسخة الكاملة من IPIP-NEO-120 مع 30 وجهاً فرعياً ونمط شخصية تفصيلي.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">120 سؤالاً</span>
                  <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">~15 دقيقة</span>
                  <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">30 وجهاً فرعياً</span>
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
