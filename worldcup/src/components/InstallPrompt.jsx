import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallPrompt() {
  const { installPrompt, isInstalled, isIOS, triggerInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('install_dismissed') === 'true'
  )
  const [showIOSModal, setShowIOSModal] = useState(false)

  if (isInstalled || dismissed) return null
  if (!installPrompt && !isIOS) return null

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('install_dismissed', 'true')
  }

  return (
    <>
      <div className="fixed bottom-20 left-4 right-4 z-40 safe-bottom">
        <div className="card p-4 border-emerald-500/40 bg-gradient-to-r from-emerald-900/90 to-slate-800/90 backdrop-blur-lg shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
              ⚽
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">ثبّت التطبيق على هاتفك</p>
              <p className="text-slate-400 text-xs mt-0.5">تابع المباريات بدون إنترنت</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-200 p-1 text-lg"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              if (isIOS) setShowIOSModal(true)
              else triggerInstall()
            }}
            className="btn-primary w-full mt-3 text-sm"
          >
            📲 اضغط هنا لتثبيت التطبيق على هاتفك
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end modal-backdrop"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full bg-slate-800 rounded-t-3xl p-6 pb-10 modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white text-center mb-2">تثبيت التطبيق على iOS</h3>
            <p className="text-slate-400 text-center text-sm mb-6">اتبع هذه الخطوات لتثبيت التطبيق من Safari</p>

            <div className="space-y-4">
              {[
                { icon: '1️⃣', text: 'افتح الرابط في متصفح Safari على هاتفك' },
                { icon: '2️⃣', text: 'اضغط على زر المشاركة (□↑) في أسفل الشاشة' },
                { icon: '3️⃣', text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
                { icon: '4️⃣', text: 'اضغط "إضافة" في الزاوية اليمنى العليا' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-700/50 rounded-xl p-3">
                  <span className="text-2xl">{step.icon}</span>
                  <p className="text-white text-sm font-medium">{step.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="btn-primary w-full mt-6"
            >
              فهمت، شكراً!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
