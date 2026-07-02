import { useState } from 'react';
import { loadDemographicProfile, profileCompleteness } from '../engine/demographicTypes';

interface SettingsPageProps {
  onHome: () => void;
  onSelectIntake: () => void;
}

const FONT_LEVELS = [
  { value: '16px', label: 'عادي',  desc: 'الحجم الافتراضي' },
  { value: '18px', label: 'كبير',  desc: 'مناسب لقراءة مريحة' },
  { value: '20px', label: 'أكبر', desc: 'لراحة العين الكاملة' },
] as const;

const RESET_KEYS = [
  'psy_results',
  'attachment_results',
  'schema_results',
  'nafees_social_patterns_result',
  'nafees_social_patterns_progress',
  'nafees_synthesis_result',
  'nafees_demographic_profile',
  'ocean_test_progress',
  'nafees_font_size',
];

export default function SettingsPage({ onHome, onSelectIntake }: SettingsPageProps) {
  const demoProfile = loadDemographicProfile();
  const demoFilled = demoProfile ? profileCompleteness(demoProfile) : 0;

  const [fontSize, setFontSize] = useState<string>(
    () => (typeof document !== 'undefined' && document.documentElement.style.fontSize) || '16px',
  );
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  function applyFontSize(size: string) {
    setFontSize(size);
    document.documentElement.style.fontSize = size;
    try { localStorage.setItem('nafees_font_size', size); } catch {}
  }

  function handleReset() {
    RESET_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
    document.documentElement.style.fontSize = '16px';
    setFontSize('16px');
    setResetDone(true);
    setShowResetModal(false);
  }

  return (
    <div className="min-h-screen bg-nafees-cream" dir="rtl">

      {/* Header */}
      <div className="bg-nafees-navy px-4 pt-5 pb-8 rounded-b-[2.5rem]">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-nafees-cream mb-1">الإعدادات</h1>
          <p className="text-nafees-sky/80 text-sm">تخصيص التطبيق وإدارة البيانات</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-5">

        {/* Contextual Profile */}
        <button
          onClick={onSelectIntake}
          className="w-full bg-nafees-navy rounded-2xl p-5 border border-nafees-navy shadow-sm text-right active:scale-[0.98] transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 text-xl">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-nafees-cream mb-0.5">ملفك السياقي الديموغرافي</h2>
              <p className="text-[10px] text-nafees-sky/80 leading-relaxed">
                {demoFilled > 0
                  ? `مكتمل ${demoFilled} من 8 حقول — انقر لتعديله`
                  : 'لم تُضَف أي بيانات بعد — انقر للبدء'}
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <span className="text-nafees-cream text-lg">←</span>
              {demoFilled > 0 && (
                <span className="text-[9px] text-nafees-sage font-bold">{Math.round((demoFilled / 8) * 100)}%</span>
              )}
            </div>
          </div>
        </button>

        {/* Font Size */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <h2 className="text-sm font-bold text-nafees-navy mb-1">حجم الخط</h2>
          <p className="text-[10px] text-nafees-warm mb-4">يؤثر على حجم جميع النصوص في التطبيق</p>
          <div className="space-y-2">
            {FONT_LEVELS.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => applyFontSize(value)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 active:scale-[0.98] ${
                  fontSize === value
                    ? 'bg-nafees-navy text-nafees-cream border-nafees-navy'
                    : 'bg-nafees-cream text-nafees-navy border-nafees-cream-dark/50'
                }`}
              >
                <div className="text-right">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className={`block text-[10px] ${fontSize === value ? 'text-nafees-sky/80' : 'text-nafees-warm'}`}>
                    {desc}
                  </span>
                </div>
                <span
                  className={`font-bold flex-shrink-0 ${fontSize === value ? 'text-nafees-copper' : 'text-nafees-warm'}`}
                  style={{ fontSize: value }}
                >
                  أ
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl p-5 border border-nafees-cream-dark/30 shadow-sm">
          <h2 className="text-sm font-bold text-nafees-navy mb-3">الخصوصية</h2>
          <div className="bg-nafees-cream-dark/40 rounded-xl p-3">
            <p className="text-[10px] text-nafees-warm-dark leading-relaxed">
              🔒 جميع بياناتك (نتائج الاختبارات، الملف الشخصي، الإعدادات) محفوظة محلياً على جهازك فقط —
              لا تُرسَل إلى أي خادم خارجي ولا تُشارَك مع أحد.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-sm">
          <h2 className="text-sm font-bold text-red-500 mb-1">منطقة الخطر</h2>
          <p className="text-[10px] text-nafees-warm mb-4 leading-relaxed">
            يحذف جميع نتائج الاختبارات والملف الشخصي والإعدادات — لا يمكن التراجع عن هذا الإجراء.
          </p>
          {resetDone ? (
            <div className="bg-nafees-sage/10 border border-nafees-sage/30 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-bold text-nafees-sage">✓ تم مسح جميع البيانات بنجاح</p>
            </div>
          ) : (
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full py-3 rounded-xl border-2 border-red-300 text-red-500 text-sm font-bold active:scale-95 transition-all duration-200 hover:bg-red-50"
            >
              مسح جميع البيانات
            </button>
          )}
        </div>

        {/* Version */}
        <p className="text-center text-[10px] text-nafees-warm">
          نفيس · مختبر الشخصية النفسية · v2.0
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="w-full max-w-md bg-nafees-cream rounded-t-3xl shadow-2xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-1 pb-4">
              <div className="w-10 h-1 bg-nafees-cream-dark rounded-full" />
            </div>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-nafees-navy mb-2">هل أنت متأكد؟</h3>
              <p className="text-sm text-nafees-warm leading-relaxed" dir="rtl">
                سيتم حذف جميع نتائج الاختبارات والملف الشخصي والإعدادات.
                هذا الإجراء <strong>لا يمكن التراجع عنه</strong>.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-red-500 text-white rounded-2xl text-sm font-bold active:scale-95 transition-transform duration-150"
              >
                نعم، احذف جميع البيانات
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="w-full py-3 rounded-2xl border border-nafees-cream-dark/60 text-nafees-navy text-sm font-semibold active:scale-95 transition-transform duration-150"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
