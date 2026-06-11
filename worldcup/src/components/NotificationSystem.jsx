import { useState, useEffect, useRef } from 'react'
import { playNotificationSound, haptic } from '../utils/audioUtils'

export default function NotificationSystem() {
  const [permission, setPermission] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'default')
  )
  const [toast, setToast] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const toastTimer = useRef(null)

  // Show the permission prompt after 4 seconds if not yet decided
  useEffect(() => {
    if (permission === 'default') {
      const t = setTimeout(() => setShowPrompt(true), 4000)
      return () => clearTimeout(t)
    }
  }, [permission])

  // Listen for alerts fired by fireWorldCupAlert() and the simulator
  useEffect(() => {
    const onAlert = (e) => {
      const { title, body, icon } = e.detail ?? {}
      showToast({ title, body, icon })
    }
    window.addEventListener('wc-alert', onAlert)
    return () => window.removeEventListener('wc-alert', onAlert)
  }, [])

  function showToast(notif) {
    clearTimeout(toastTimer.current)
    setToast(notif)
    toastTimer.current = setTimeout(() => setToast(null), 6000)
  }

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
    setShowPrompt(false)
    if (result === 'granted') {
      showToast({
        title: '✅ تم تفعيل الإشعارات',
        body: 'ستصلك تنبيهات الأهداف والمباريات فوراً!',
        icon: '✅',
      })
      playNotificationSound()
      haptic([50, 30, 50])
    }
  }

  return (
    <>
      {/* Permission prompt banner */}
      {showPrompt && permission === 'default' && (
        <div className="fixed top-4 left-4 right-4 z-50 safe-top animate-slideUp">
          <div className="card p-4 border-amber-500/40 bg-gradient-to-r from-amber-900/90 to-slate-800/90 backdrop-blur-lg shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🔔</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">فعّل إشعارات الأهداف</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  احصل على تنبيهات الأهداف والنتائج فوراً حتى والتطبيق في الخلفية
                </p>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-slate-400 hover:text-white p-1 flex-shrink-0"
              >✕</button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={requestPermission}
                className="btn-gold flex-1 text-sm py-2.5"
              >
                🔔 تفعيل الإشعارات
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-slate-400 text-sm px-3 hover:text-white"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app toast */}
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 safe-top animate-slideUp">
          <div className="card p-4 border-emerald-500/40 bg-slate-800/97 backdrop-blur-lg shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{toast.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{toast.title}</p>
                <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{toast.body}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white p-1 flex-shrink-0"
              >✕</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
