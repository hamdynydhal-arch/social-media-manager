import { useState, useEffect, useRef } from 'react'
import { playNotificationSound, haptic } from '../utils/audioUtils'

export default function NotificationSystem() {
  const [permission, setPermission] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'default')
  )
  const [toast, setToast]           = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const toastTimer                  = useRef(null)

  // Show modal 2 s after first visit for non-granted states; re-show after 20 min
  useEffect(() => {
    if (permission === 'granted') return
    const t1 = setTimeout(() => setShowPrompt(true), 2000)
    const t2 = setTimeout(() => {
      if (Notification.permission !== 'granted') setShowPrompt(true)
    }, 20 * 60_000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [permission])

  // Allow any component to force-open the modal via custom event
  useEffect(() => {
    const onForce = () => setShowPrompt(true)
    window.addEventListener('wc-show-notif-prompt', onForce)
    return () => window.removeEventListener('wc-show-notif-prompt', onForce)
  }, [])

  // Listen for in-app alert events fired by useLiveEvents
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
      {/* ── Permission modal ─────────────────────────────────────────────── */}
      {showPrompt && permission !== 'granted' && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed', inset: 0, zIndex: 9990,
            background: 'rgba(0,0,0,0.90)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={e => e.target === e.currentTarget && setShowPrompt(false)}
        >
          <div
            dir="rtl"
            className="modal-content notif-glow"
            style={{
              background: 'linear-gradient(160deg, #1c0505 0%, #3b0a0a 45%, #1c0505 100%)',
              border: '2px solid #ef4444',
              borderRadius: '28px',
              padding: '28px 22px 22px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Radial glow behind bell */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '170px',
              background: 'radial-gradient(ellipse at 50% -10%, rgba(239,68,68,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Close button */}
            <button
              onClick={() => setShowPrompt(false)}
              style={{
                position: 'absolute', top: '14px', left: '14px',
                color: '#6b7280', fontSize: '1.1rem',
                background: 'none', border: 'none', cursor: 'pointer',
                width: '30px', height: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>

            {/* Bell icon — rings on loop */}
            <div style={{ textAlign: 'center', marginBottom: '14px', position: 'relative' }}>
              <span
                className="bell-ring"
                style={{ fontSize: '3.8rem', filter: 'drop-shadow(0 0 16px rgba(239,68,68,0.8))' }}
              >
                🔔
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              textAlign: 'center', color: '#fff',
              fontSize: '1.3rem', fontWeight: 900,
              margin: '0 0 6px', lineHeight: 1.3,
            }}>
              لا تفوتك لحظة في
              <span style={{ color: '#f87171' }}> كأس العالم 2026</span>
            </h2>
            <p style={{
              textAlign: 'center', color: '#fca5a5',
              fontSize: '0.82rem', margin: '0 0 18px', lineHeight: 1.5,
            }}>
              فعّل الإشعارات لتصلك التنبيهات فورياً على شاشة هاتفك
            </p>

            {/* Benefits list */}
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              {[
                ['⚽', 'إشعار فوري عند كل هدف مع صوت وارتجاج'],
                ['⏰', 'تنبيه قبل انطلاق كل مباراة بـ 30 دقيقة'],
                ['📵', 'تعمل حتى عندما يكون التطبيق مغلقاً'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: '#fde8e8', fontSize: '0.87rem', fontWeight: 600 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Preview mini-toast */}
            <div style={{
              background: 'linear-gradient(135deg, #cc0000 0%, #ff1a1a 50%, #cc0000 100%)',
              border: '2px solid #ffdd00',
              borderRadius: '14px',
              padding: '10px 12px',
              marginBottom: '18px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '1.7rem', lineHeight: 1 }}>⚽</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: '0.85rem', margin: 0, lineHeight: 1.3 }}>
                  🚨 هدف! المغرب 1-0 فرنسا
                </p>
                <p style={{ color: '#ffe4e4', fontSize: '0.75rem', margin: '3px 0 0', fontWeight: 600 }}>
                  ⭐ منتخبك يسجل! — د.67
                </p>
              </div>
              <span style={{
                fontSize: '0.65rem', color: '#ffdd00', fontWeight: 900,
                border: '1px solid #ffdd00', borderRadius: '6px',
                padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                معاينة
              </span>
            </div>

            {/* Enable / re-enable button */}
            {permission === 'denied' ? (
              <div style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '10px',
                textAlign: 'center',
              }}>
                <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 8px' }}>
                  🚫 الإشعارات محظورة على هذا المتصفح
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                  لإعادة التفعيل: افتح <strong style={{ color: '#fde8e8' }}>إعدادات المتصفح</strong> ← إعدادات الموقع ← الإشعارات ← اضغط &quot;سماح&quot;
                </p>
              </div>
            ) : (
              <button
                onClick={requestPermission}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #b91c1c 100%)',
                  color: '#fff',
                  border: '2px solid #fca5a5',
                  borderRadius: '16px',
                  padding: '15px',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 0 28px rgba(239,68,68,0.55)',
                  marginBottom: '10px',
                  letterSpacing: '0.01em',
                  transition: 'transform 0.15s',
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                🔔 تفعيل الإشعارات الآن
              </button>
            )}

            <button
              onClick={() => setShowPrompt(false)}
              style={{
                width: '100%', background: 'none', border: 'none',
                color: '#6b7280', fontSize: '0.83rem',
                cursor: 'pointer', padding: '6px',
              }}
            >
              لاحقاً — سأفعّلها من الإعدادات
            </button>
          </div>
        </div>
      )}

      {/* ── In-app alert toast ───────────────────────────────────────────── */}
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
                <p style={{
                  fontWeight: 900, color: '#ffffff',
                  fontSize: toast.isFav ? '1.15rem' : '1rem',
                  lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}>
                  {toast.title}
                </p>
                <p style={{
                  fontWeight: 700, color: '#ffe4e4',
                  fontSize: '0.9rem', marginTop: '0.3rem', lineHeight: 1.4,
                }}>
                  {toast.body}
                </p>
              </div>
              <button
                onClick={() => { clearTimeout(toastTimer.current); setToast(null) }}
                style={{ color: '#ffaaaa', fontSize: '1.2rem' }}
                className="hover:text-white p-1 flex-shrink-0"
              >
                ✕
              </button>
            </div>
            {toast.isFav && (
              <div style={{
                height: '4px',
                background: 'linear-gradient(90deg, transparent, #ffdd00, transparent)',
                borderRadius: '2px', marginTop: '10px',
              }} />
            )}
          </div>
        </div>
      )}
    </>
  )
}
