import { useState } from 'react'
import { playGoalSound, playNotificationSound, playWhistleSound } from '../utils/audioUtils'
import { fireWorldCupAlert } from '../hooks/useLiveEvents'
import { useWorldCupData } from '../context/WorldCupContext'
import confetti from 'canvas-confetti'

const BASE = import.meta.env.BASE_URL

export default function Settings({ favoriteTeam, onChangeFavorite, simRunning, onStartSim, onStopSim, apiMode, lastUpdated }) {
  const { data, sources, refresh } = useWorldCupData()
  const favTeam = data.teams.find(t => t.id === favoriteTeam)
  const [notifPerm, setNotifPerm] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'default')
  )
  const [testStatus, setTestStatus] = useState(null) // null | 'sending' | 'ok' | 'denied'

  const testGoalFX = () => {
    playGoalSound()
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200])
  }

  const requestNotifPermission = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setNotifPerm(result)
    if (result === 'granted') {
      fireWorldCupAlert(
        '✅ تم تفعيل الإشعارات بنجاح!',
        'ستصلك تنبيهات الأهداف والمباريات حتى والتطبيق في الخلفية.',
        'notification'
      )
    }
  }

  const sendRealTestNotification = async () => {
    setTestStatus('sending')

    let perm = notifPerm
    if (perm !== 'granted' && typeof Notification !== 'undefined') {
      perm = await Notification.requestPermission()
      setNotifPerm(perm)
    }

    if (perm !== 'granted') {
      setTestStatus('denied')
      setTimeout(() => setTestStatus(null), 3000)
      return
    }

    // Immediate audio + haptic feedback
    playGoalSound()
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200])

    const iconUrl = BASE + 'icons/icon-192.png'
    const notifTitle = '⚽ هدف! — اختبار إشعار كأس العالم 2026'
    const notifOpts = {
      body: 'نجح الاختبار! هكذا ستظهر إشعارات الأهداف والمباريات على شاشتك حتى عند إغلاق التطبيق.',
      icon: iconUrl,
      badge: iconUrl,
      dir: 'rtl',
      lang: 'ar',
      tag: 'wc-test-goal',
      renotify: true,
      vibrate: [100, 50, 100, 50, 200],
    }

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        await reg.showNotification(notifTitle, notifOpts)
      } else {
        new Notification(notifTitle, notifOpts)
      }
      setTestStatus('ok')
    } catch {
      try {
        navigator.serviceWorker?.controller?.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: notifTitle,
          body: notifOpts.body,
          tag: 'wc-test-goal',
          vibrate: [100, 50, 100, 50, 200],
        })
        setTestStatus('ok')
      } catch {
        setTestStatus('denied')
      }
    }
    setTimeout(() => setTestStatus(null), 4000)
  }

  const notifStatusLabel = {
    granted: '✅ مفعّلة',
    denied: '🚫 محظورة',
    default: '🔕 غير مفعّلة',
  }[notifPerm] ?? '🔕 غير مفعّلة'

  const notifStatusColor = {
    granted: 'text-emerald-400',
    denied: 'text-red-400',
    default: 'text-amber-400',
  }[notifPerm] ?? 'text-amber-400'

  return (
    <div className="px-4 py-4 pb-24 space-y-4">

      {/* ── Favorite Team ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">⭐ المنتخب المفضل</h3>
        {favTeam ? (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{favTeam.flag}</span>
            <div>
              <p className="font-bold text-white">{favTeam.name}</p>
              <p className="text-xs text-slate-400">المدرب: {favTeam.coach}</p>
              <p className="text-xs text-slate-500">المجموعة {favTeam.group}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm mb-3">لم تختر منتخباً بعد</p>
        )}
        <button
          onClick={onChangeFavorite}
          className="w-full py-2.5 bg-slate-700/80 border border-slate-600/50 text-white text-sm font-bold rounded-xl hover:bg-slate-600/80 transition-colors"
        >
          تغيير المنتخب المفضل
        </button>
      </div>

      {/* ── Real Test Notification (prominent) ── */}
      <div className="card p-4 border-amber-500/30 bg-gradient-to-r from-amber-900/15 to-transparent">
        <h3 className="font-bold text-white mb-1 flex items-center gap-2">📳 اختبار إشعار الشاشة والصوت</h3>
        <p className="text-slate-400 text-xs mb-3 leading-relaxed">
          اضغط الزر لإرسال إشعار حقيقي يظهر على شاشتك من الأعلى — حتى لو أغلقت التطبيق — مع صوت وتنبيه.
        </p>
        <button
          onClick={sendRealTestNotification}
          disabled={testStatus === 'sending'}
          className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95 disabled:opacity-60"
          style={{
            background:
              testStatus === 'ok'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : testStatus === 'denied'
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 6px 24px rgba(245,158,11,0.35)',
          }}
        >
          {testStatus === 'sending' && '⏳ جاري الإرسال...'}
          {testStatus === 'ok' && '✅ وصل الإشعار بنجاح!'}
          {testStatus === 'denied' && '🚫 الإشعارات محظورة — افتح إعدادات المتصفح'}
          {!testStatus && '📳 اختبار إشعار الشاشة والصوت الآن'}
        </button>
        {notifPerm !== 'granted' && (
          <p className="text-center text-amber-400/70 text-xs mt-2">
            سيُطلب منك السماح بالإشعارات عند الضغط
          </p>
        )}
      </div>

      {/* ── Notifications ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">🔔 إعدادات الإشعارات</h3>
        <div className="flex items-center justify-between mb-3 bg-slate-700/30 rounded-xl px-3 py-2">
          <span className="text-slate-300 text-sm">حالة الإشعارات</span>
          <span className={`text-sm font-bold ${notifStatusColor}`}>{notifStatusLabel}</span>
        </div>

        {notifPerm !== 'granted' && notifPerm !== 'denied' && (
          <button
            onClick={requestNotifPermission}
            className="w-full py-3 rounded-xl font-bold text-white text-sm mb-2 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}
          >
            🔔 تفعيل إشعارات الأهداف والمباريات
          </button>
        )}

        {notifPerm === 'denied' && (
          <p className="text-xs text-red-400 text-center px-2">
            الإشعارات محظورة في إعدادات المتصفح. افتح إعدادات المتصفح وأعد السماح لهذا الموقع.
          </p>
        )}

        {notifPerm === 'granted' && (
          <button
            onClick={() => fireWorldCupAlert('🔔 اختبار الإشعارات', 'إشعارات كأس العالم 2026 تعمل بشكل صحيح!', 'notification')}
            className="w-full py-2.5 bg-slate-700/80 border border-slate-600/50 text-white text-sm rounded-xl hover:bg-slate-600/80 transition-colors"
          >
            🧪 إشعار داخلي تجريبي
          </button>
        )}
      </div>

      {/* ── Live Simulator ── */}
      <div className="card p-4 border-blue-500/20">
        <h3 className="font-bold text-white mb-1 flex items-center gap-2">🎮 محاكي المباريات الحية</h3>
        <p className="text-slate-400 text-xs mb-3 leading-relaxed">
          يُشغّل مباراة وهمية لمنتخبك المفضل ويُطلق إشعاراً وصوتاً كل 10 ثوانٍ لاختبار تجربة البث الحي كاملةً.
        </p>

        {!favTeam ? (
          <p className="text-amber-400 text-xs text-center py-2">اختر منتخباً مفضلاً أولاً</p>
        ) : simRunning ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/30 rounded-xl px-3 py-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-emerald-400 text-xs font-bold">المحاكاة تعمل — ترقّب الإشعارات كل 10 ثوانٍ</span>
            </div>
            <button
              onClick={onStopSim}
              className="w-full py-2.5 bg-red-600/80 border border-red-500/50 text-white text-sm font-bold rounded-xl hover:bg-red-500/80 transition-colors active:scale-95"
            >
              ⏹️ إيقاف المحاكاة
            </button>
          </div>
        ) : (
          <button
            onClick={onStartSim}
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}
          >
            ▶️ تشغيل وضع المحاكاة
          </button>
        )}
      </div>

      {/* ── Sound FX Test ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">🔊 اختبار المؤثرات الصوتية</h3>
        <div className="space-y-2">
          {[
            { label: '⚽ صوت الهدف + احتفال', fn: testGoalFX },
            { label: '🔔 صوت الإشعار', fn: playNotificationSound },
            { label: '🎺 صافرة الحكم', fn: playWhistleSound },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              className="w-full py-2.5 bg-slate-700/80 border border-slate-600/50 text-white text-sm rounded-xl hover:bg-slate-600/80 transition-colors text-right px-4"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stadiums ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">🏟️ الملاعب الرسمية</h3>
        <div className="space-y-2">
          {data.stadiums.map(s => (
            <div key={s.id} className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-3">
              <span className="text-xl">🏟️</span>
              <div>
                <p className="font-bold text-white text-sm">{s.name}</p>
                <p className="text-xs text-slate-400">{s.city}، {s.country}</p>
                <p className="text-xs text-emerald-400">{s.capacity.toLocaleString('ar-SA')} مقعد</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live Data Source ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">🌐 مصادر البيانات المفتوحة</h3>
        <div className="space-y-2 mb-3">
          {[
            { label: 'نتائج مباشرة', src: 'ESPN Public API', active: sources?.scores },
            { label: 'ترتيب المجموعات', src: 'ESPN Standings', active: sources?.standings },
            { label: 'أخبار عاجلة', src: 'BBC Sport RSS', active: sources?.news },
          ].map(({ label, src, active }) => (
            <div key={label} className="flex items-center justify-between bg-slate-700/30 rounded-xl px-3 py-2">
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-slate-500 text-xs">{src}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                {active ? '🟢 متصل' : '⭕ غير متاح'}
              </span>
            </div>
          ))}
        </div>
        {lastUpdated && (
          <p className="text-xs text-slate-500 text-center mb-2">
            آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA')} — يتجدد كل 60 ثانية
          </p>
        )}
        <button
          onClick={refresh}
          className="w-full py-2.5 bg-slate-700/80 border border-slate-600/50 text-white text-sm rounded-xl hover:bg-slate-600/80 transition-colors"
        >
          🔄 تحديث فوري
        </button>
        <p className="text-center text-slate-600 text-xs mt-2">
          لا يتطلب مفاتيح API أو حسابات خارجية
        </p>
      </div>

      {/* ── App Info ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3">📱 معلومات التطبيق</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'الإصدار', val: '4.0.0' },
            { label: 'البطولة', val: 'كأس العالم FIFA 2026' },
            { label: 'الدول المستضيفة', val: 'الولايات المتحدة • كندا • المكسيك' },
            { label: 'المنتخبات', val: `${data.teams.length} منتخب` },
            { label: 'المباريات', val: `${data.matches.length} مباراة` },
            { label: 'الملاعب', val: `${data.stadiums.length} ملعباً` },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between">
              <span className="text-slate-400">{label}</span>
              <span className="text-white font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 border-emerald-500/20 bg-gradient-to-r from-emerald-900/20 to-transparent">
        <p className="text-center text-slate-400 text-sm">🏆 كأس العالم 2026 — متابع من كل مكان</p>
        <p className="text-center text-slate-500 text-xs mt-1">يعمل بدون إنترنت • إشعارات فورية • RTL عربي</p>
      </div>
    </div>
  )
}
