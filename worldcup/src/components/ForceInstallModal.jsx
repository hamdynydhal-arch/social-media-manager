import { useState, useEffect } from 'react'

export default function ForceInstallModal({ installState = {} }) {
  const { installPrompt, isInstalled, isIOS, triggerInstall } = installState
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [notifPerm, setNotifPerm] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'granted')
  )

  useEffect(() => {
    if (isInstalled) return
    if (localStorage.getItem('wc_force_modal_dismissed') === 'true') return
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [isInstalled])

  const needsNotif = notifPerm === 'default'
  const canInstall = installPrompt || isIOS

  if (!visible || isInstalled || (!canInstall && !needsNotif)) return null

  const dismiss = () => {
    localStorage.setItem('wc_force_modal_dismissed', 'true')
    setVisible(false)
  }

  const requestNotif = async () => {
    if (typeof Notification === 'undefined') return
    const perm = await Notification.requestPermission()
    setNotifPerm(perm)
    return perm
  }

  const handleAndroidInstall = async () => {
    if (needsNotif) await requestNotif()
    if (installPrompt && triggerInstall) {
      setInstalling(true)
      await triggerInstall()
      setInstalling(false)
      setVisible(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0f2d1f 0%, #0a1628 100%)',
          border: '1.5px solid rgba(52,211,153,0.35)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(16,185,129,0.15)',
        }}
      >
        <div className="text-center px-6 pt-7 pb-4">
          <div className="text-6xl mb-3 animate-bounce">⚽</div>
          <h2 className="text-xl font-black text-white mb-1">ثبّت التطبيق الآن!</h2>
          <p className="text-emerald-300 text-sm font-bold mb-2">كأس العالم 2026 — إشعارات الأهداف الفورية</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            لا تفوّت أي هدف. التطبيق يعمل في الخلفية ويُنبّهك فور وقوع أي حدث.
          </p>
        </div>

        <div className="px-5 pb-6 space-y-3">
          {isIOS ? (
            <>
              <p className="text-center text-slate-300 text-sm font-bold">لتثبيت التطبيق على iPhone / iPad:</p>
              {[
                { n: '1', icon: '⬆️', label: 'اضغط زر المشاركة', sub: 'الزر المربع بسهم للأعلى في شريط Safari السفلي' },
                { n: '2', icon: '➕', label: 'اختر "إضافة إلى الشاشة الرئيسية"', sub: '' },
                { n: '3', icon: '✅', label: 'اضغط "إضافة" في الزاوية العلوية', sub: '' },
              ].map(({ n, icon, label, sub }) => (
                <div key={n} className="flex items-center gap-3 bg-slate-800/60 rounded-2xl px-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-xs">{n}</span>
                  </div>
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                    {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
                  </div>
                </div>
              ))}
              {needsNotif && (
                <button
                  onClick={requestNotif}
                  className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}
                >
                  🔔 تفعيل إشعارات الأهداف أيضاً
                </button>
              )}
              <button onClick={dismiss} className="w-full py-2 text-slate-500 text-xs font-medium">ليس الآن</button>
            </>
          ) : (
            <>
              <button
                onClick={handleAndroidInstall}
                disabled={installing || !installPrompt}
                className="w-full py-4 rounded-2xl font-black text-slate-900 text-base transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', boxShadow: '0 6px 24px rgba(52,211,153,0.45)' }}
              >
                {installing ? '⏳ جاري التثبيت...' : '📲 تثبيت التطبيق الآن'}
              </button>
              {needsNotif && (
                <div className="bg-amber-900/30 border border-amber-500/30 rounded-2xl p-3 text-center">
                  <p className="text-amber-300 text-xs font-bold">🔔 سيُطلب منك تفعيل الإشعارات أيضاً</p>
                  <p className="text-amber-400/60 text-xs mt-0.5">اضغط "السماح" لتلقي تنبيهات الأهداف الفورية</p>
                </div>
              )}
              {!installPrompt && needsNotif && (
                <button
                  onClick={requestNotif}
                  className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}
                >
                  🔔 تفعيل إشعارات الأهداف
                </button>
              )}
              <button onClick={dismiss} className="w-full py-2 text-slate-500 text-xs font-medium">ليس الآن</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
