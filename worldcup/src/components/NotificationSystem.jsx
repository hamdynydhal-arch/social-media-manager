import { useState, useEffect, useRef } from 'react'
import { playNotificationSound, haptic } from '../utils/audioUtils'

export default function NotificationSystem() {
  const [permission, setPermission] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'default')
  )
  const [toast, setToast] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const toastTimer = useRef(null)

  // Show permission prompt: immediately on first visit, or again after 15 min if still default
  useEffect(() => {
    if (permission !== 'default') return
    // Show right away on first load
    const t1 = setTimeout(() => setShowPrompt(true), 1500)
    // Re-show after 15 min if still not decided
    const t2 = setTimeout(() => {
      if (Notification.permission === 'default') setShowPrompt(true)
    }, 15 * 60_000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
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
      {/* Permission prompt — prominent, explains native phone notifications */}
      {showPrompt && permission === 'default' && (
        <div
          dir="rtl"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9990, padding: '12px 12px 0' }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #78350f 100%)',
              border: '2px solid #fbbf24',
              borderRadius: '16px',
              padding: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '2.2rem', flexShrink: 0 }}>🔔</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, color: '#fff', fontSize: '1rem', margin: 0 }}>
                  فعّل الإشعارات على شاشة هاتفك
                </p>
                <p style={{ color: '#fde68a', fontSize: '0.82rem', margin: '4px 0 0', lineHeight: 1.4 }}>
                  تنبيه قبل كل مباراة بـ 30 دقيقة + إشعار فوري عند كل هدف — حتى عندما يكون التطبيق مغلقاً
                </p>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                style={{ color: '#fca5a5', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
              >✕</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={requestPermission}
                style={{
                  flex: 1, background: '#fbbf24', color: '#78350f',
                  border: 'none', borderRadius: '10px', padding: '10px',
                  fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                🔔 تفعيل الإشعارات الآن
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                style={{ color: '#fca5a5', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}
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
