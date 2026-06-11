import { useState, useEffect, useRef } from 'react'
import { playNotificationSound, haptic } from '../utils/audioUtils'

const MOCK_NOTIFICATIONS = [
  { title: '⚽ هدف! هدف رائع!', body: 'فينيسيوس جونيور يسجل الهدف الثالث للبرازيل في الدقيقة 78!', icon: '⚽' },
  { title: '🔴 بطاقة حمراء!', body: 'طرد لاعب من المنتخب الألماني بعد احتجاجه على الحكم', icon: '🔴' },
  { title: '⏱️ الوقت الإضافي', body: '5 دقائق وقت بدل ضائع في مباراة الأرجنتين والمغرب', icon: '⏱️' },
  { title: '🏆 صافرة النهاية', body: 'إسبانيا تفوز بنتيجة 2-0 وتتأهل لدور الـ 16', icon: '🏆' },
  { title: '🎯 ضربة جزاء!', body: 'حكم المباراة يمنح ضربة جزاء للمنتخب الفرنسي', icon: '🎯' },
  { title: '🔄 تبديل مفاجئ', body: 'ميسي يدخل الملعب في الدقيقة 60 بدلاً من ألفاريز', icon: '🔄' },
  { title: '📊 إحصائية مثيرة', body: 'المغرب أكثر المنتخبات تسديداً في الدور الأول بـ 47 تسديدة', icon: '📊' },
  { title: '⚽ هدف من ضربة رأس!', body: 'هاري كين يسجل هدفاً رائعاً من ضربة رأس في الدقيقة 55!', icon: '⚽' },
]

let notifIndex = 0

export default function NotificationSystem() {
  const [permission, setPermission] = useState(Notification?.permission || 'default')
  const [toast, setToast] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [mockEnabled, setMockEnabled] = useState(
    () => localStorage.getItem('mock_notif') !== 'false'
  )
  const intervalRef = useRef(null)

  useEffect(() => {
    if (permission === 'default') {
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [permission])

  useEffect(() => {
    if (!mockEnabled) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      const notif = MOCK_NOTIFICATIONS[notifIndex % MOCK_NOTIFICATIONS.length]
      notifIndex++
      showToast(notif)
      if (permission === 'granted') {
        try {
          new Notification(notif.title, {
            body: notif.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            dir: 'rtl',
            lang: 'ar',
          })
        } catch {}
      }
    }, 3 * 60 * 1000)

    return () => clearInterval(intervalRef.current)
  }, [mockEnabled, permission])

  function showToast(notif) {
    playNotificationSound()
    haptic([50, 30, 50])
    setToast(notif)
    setTimeout(() => setToast(null), 5000)
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
    setShowPrompt(false)
    if (result === 'granted') {
      showToast({ title: '✅ تم تفعيل الإشعارات', body: 'ستصلك تنبيهات المباريات والأهداف فوراً!', icon: '✅' })
    }
  }

  const toggleMock = () => {
    const next = !mockEnabled
    setMockEnabled(next)
    localStorage.setItem('mock_notif', String(next))
  }

  const testNotif = () => {
    const notif = MOCK_NOTIFICATIONS[Math.floor(Math.random() * MOCK_NOTIFICATIONS.length)]
    showToast(notif)
  }

  return (
    <>
      {showPrompt && permission === 'default' && (
        <div className="fixed top-4 left-4 right-4 z-50 safe-top">
          <div className="card p-4 border-amber-500/40 bg-gradient-to-r from-amber-900/90 to-slate-800/90 backdrop-blur-lg shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🔔</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">فعّل الإشعارات</p>
                <p className="text-slate-400 text-xs mt-0.5">احصل على تنبيهات الأهداف والنتائج فوراً</p>
              </div>
              <button onClick={() => setShowPrompt(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={requestPermission} className="btn-gold flex-1 text-sm py-2">
                تفعيل الإشعارات 🔔
              </button>
              <button onClick={() => setShowPrompt(false)} className="text-slate-400 text-sm px-3 hover:text-white">
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 safe-top animate-slideUp">
          <div className="card p-4 border-emerald-500/40 bg-slate-800/95 backdrop-blur-lg shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{toast.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{toast.title}</p>
                <p className="text-slate-300 text-xs mt-0.5">{toast.body}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-1 flex-shrink-0">✕</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-2 items-end">
        <button
          onClick={testNotif}
          className="bg-slate-700/90 backdrop-blur-sm border border-slate-600/50 text-white text-xs px-3 py-2 rounded-xl shadow-lg hover:bg-slate-600/90 transition-colors"
          title="اختبار إشعار"
        >
          🔔 اختبار
        </button>
        <button
          onClick={toggleMock}
          className={`text-xs px-3 py-2 rounded-xl shadow-lg transition-colors ${
            mockEnabled
              ? 'bg-emerald-600/90 border border-emerald-500/50 text-white'
              : 'bg-slate-700/90 border border-slate-600/50 text-slate-400'
          }`}
          title="تشغيل/إيقاف الإشعارات التجريبية"
        >
          {mockEnabled ? '🟢 تنبيهات' : '🔴 تنبيهات'}
        </button>
      </div>
    </>
  )
}
