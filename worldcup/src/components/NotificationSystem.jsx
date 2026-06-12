import { useState, useEffect, useRef } from 'react'
import { playNotificationSound, haptic } from '../utils/audioUtils'

export default function NotificationSystem() {
  const [permission, setPermission] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'default')
  )
  const [toast, setToast] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const toastTimer = useRef(null)

  useEffect(() => {
    if (permission === 'default') {
      const t = setTimeout(() => setShowPrompt(true), 4000)
      return () => clearTimeout(t)
    }
  }, [permission])

  useEffect(() => {
    const onAlert = (e) => {
      const { title, body, icon, isFav } = e.detail ?? {}
      showToast({ title, body, icon, isFav })
    }
    window.addEventListener('wc-alert', onAlert)
    return () => window.removeEventListener('wc-alert', onAlert)
  }, [])

  function showToast(notif) {
    clearTimeout(toastTimer.current)
    setToast(notif)
    toastTimer.current = setTimeout(() => setToast(null), notif.isFav ? 9000 : 6000)
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
        isFav: false,
      })
      playNotificationSound()
      haptic([50, 30, 50])
    }
  }

  return (
    <>
      {/* Permission prompt banner */}
      {showPrompt && permission === 'default' && (
        <div
          style={{ direction: 'rtl' }}
          className="fixed top-4 left-4 right-4 z-50 safe-top animate-slideUp"
        >
          <div className="rounded-2xl p-4 border border-amber-500/40 bg-gradient-to-r from-amber-900/90 to-slate-800/90 backdrop-blur-lg shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">🔔</span>
              <div className="flex-1">
                <p className="font-black text-white text-base leading-tight">فعّل إشعارات الأهداف</p>
                <p className="text-amber-200 text-sm mt-1">
                  تنبيهات الأهداف والنتائج حتى والتطبيق في الخلفية
                </p>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-slate-400 hover:text-white p-1 flex-shrink-0 text-lg"
              >✕</button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={requestPermission}
                className="btn-gold flex-1 text-sm py-2.5 font-black"
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

      {/* In-app alert toast — red, bold, impossible to miss */}
      {toast && (
        <div
          style={{ direction: 'rtl' }}
          className="fixed top-4 left-4 right-4 z-50 safe-top animate-slideUp"
        >
          <div
            style={{
              background: toast.isFav
                ? 'linear-gradient(135deg, #cc0000 0%, #ff0000 50%, #cc0000 100%)'
                : 'linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #b91c1c 100%)',
              border: toast.isFav ? '3px solid #ffdd00' : '2px solid #ff6666',
              boxShadow: toast.isFav
                ? '0 0 30px rgba(255,0,0,0.8), 0 8px 32px rgba(0,0,0,0.6)'
                : '0 0 20px rgba(255,0,0,0.5), 0 8px 24px rgba(0,0,0,0.5)',
            }}
            className="rounded-2xl p-4 backdrop-blur-lg"
          >
            <div className="flex items-start gap-3">
              <span
                style={{ fontSize: toast.isFav ? '2.5rem' : '2rem', lineHeight: 1 }}
                className="flex-shrink-0"
              >
                {toast.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontWeight: 900,
                    color: '#ffffff',
                    fontSize: toast.isFav ? '1.15rem' : '1rem',
                    lineHeight: 1.3,
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {toast.title}
                </p>
                <p
                  style={{
                    fontWeight: 700,
                    color: '#ffe4e4',
                    fontSize: '0.9rem',
                    marginTop: '0.3rem',
                    lineHeight: 1.4,
                  }}
                >
                  {toast.body}
                </p>
              </div>
              <button
                onClick={() => setToast(null)}
                style={{ color: '#ffaaaa', fontSize: '1.2rem' }}
                className="hover:text-white p-1 flex-shrink-0"
              >
                ✕
              </button>
            </div>
            {/* Fav team gold accent bar */}
            {toast.isFav && (
              <div
                style={{
                  height: '4px',
                  background: 'linear-gradient(90deg, transparent, #ffdd00, transparent)',
                  borderRadius: '2px',
                  marginTop: '10px',
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
