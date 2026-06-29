interface InstallPromptBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export default function InstallPromptBanner({ onInstall, onDismiss }: InstallPromptBannerProps) {
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 animate-slide-up"
      role="dialog"
      aria-label="تثبيت التطبيق"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 -top-screen"
        style={{ top: '-100vh' }}
        onClick={onDismiss}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-8 max-w-md mx-auto">
        {/* Handle bar */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex items-center gap-4 mb-5">
          <img src="/icon-192.png" alt="psy icon" className="w-14 h-14 rounded-2xl shadow-md" />
          <div>
            <h2 className="text-base font-extrabold text-nafees-navy">أضف نفيس إلى شاشتك الرئيسية</h2>
            <p className="text-sm text-gray-500 mt-0.5">وصول سريع في أي وقت، بدون متصفح</p>
          </div>
        </div>

        <ul className="space-y-2 mb-6 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-nafees-copper text-base">⚡</span>
            <span>تشغيل فوري بدون انتظار تحميل</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-nafees-copper text-base">📶</span>
            <span>يعمل بشكل جزئي بدون إنترنت</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-nafees-copper text-base">🔒</span>
            <span>نتائجك محفوظة محلياً على جهازك</span>
          </li>
        </ul>

        <button
          onClick={onInstall}
          className="w-full py-3.5 rounded-2xl bg-nafees-blue hover:bg-nafees-navy text-white font-bold text-base shadow-lg shadow-nafees-blue/20 active:scale-95 transition-all mb-3"
        >
          تثبيت التطبيق
        </button>

        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded-2xl text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
        >
          ليس الآن
        </button>
      </div>
    </div>
  );
}
