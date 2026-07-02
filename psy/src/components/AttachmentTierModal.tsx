export type AttachmentTier = 'core' | 'deep';

interface AttachmentTierModalProps {
  onSelect: (tier: AttachmentTier) => void;
  onCancel: () => void;
}

export default function AttachmentTierModal({ onSelect, onCancel }: AttachmentTierModalProps) {
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
          <h3 className="text-lg font-bold text-nafees-navy mb-1 text-center">اختر عمق التقييم</h3>
          <p className="text-xs text-nafees-warm text-center mb-5 leading-relaxed">
            كلا المستويين يقيسان محوري القلق والتجنب بدقة علمية
          </p>

          <button
            onClick={() => onSelect('core')}
            className="w-full bg-white border-2 border-nafees-copper/40 hover:border-nafees-copper rounded-2xl p-5 mb-3 text-right active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-nafees-copper/15 flex items-center justify-center flex-shrink-0 text-2xl">
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-nafees-navy mb-1">التقييم الأساسي</h4>
                <p className="text-xs text-nafees-warm leading-relaxed mb-3">
                  36 سؤالاً — النسخة الكاملة من ECR-R تغطي محوري القلق والتجنب بدقة عالية.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-nafees-copper/15 text-nafees-copper text-xs px-2.5 py-1 rounded-full font-semibold">36 سؤالاً</span>
                  <span className="bg-nafees-copper/15 text-nafees-copper text-xs px-2.5 py-1 rounded-full font-semibold">~10 دقائق</span>
                  <span className="bg-nafees-copper/15 text-nafees-copper text-xs px-2.5 py-1 rounded-full font-semibold">محوران</span>
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
                🔬
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-nafees-cream mb-1">التقييم الشامل</h4>
                <p className="text-xs text-nafees-sky/80 leading-relaxed mb-3">
                  72 سؤالاً — نسخة موسّعة من ECR-R لأدق تشخيص لنمط التعلق العاطفي.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">72 سؤالاً</span>
                  <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">~18 دقيقة</span>
                  <span className="bg-white/15 text-nafees-sky text-xs px-2.5 py-1 rounded-full font-semibold">تشخيص دقيق</span>
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
