import { useState, useEffect } from 'react'
import { playGoalSound, playNotificationSound, playWhistleSound } from '../utils/audioUtils'
import { fireWorldCupAlert } from '../hooks/useLiveEvents'
import { useWorldCupData } from '../context/WorldCupContext'
import confetti from 'canvas-confetti'

const BASE = import.meta.env.BASE_URL

export default function Settings({
  favoriteTeams, onChangeFavorite,
  simRunning, onStartSim, onStopSim,
  apiMode, lastUpdated,
  installState = {},
}) {
  const { data, sources, refresh } = useWorldCupData()
  const { isInstalled, isIOS } = installState
  const firstFavTeam = data.teams.find(t => t.id === favoriteTeams?.[0])

  const [notifPerm, setNotifPerm] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'default')
  )
  const [testStatus, setTestStatus] = useState(null)
  const [installing, setInstalling] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [showAndroidModal, setShowAndroidModal] = useState(false)
  const [hasNativePrompt, setHasNativePrompt] = useState(() => !!window.deferredPrompt)

  useEffect(() => {
    const onPrompt = () => setHasNativePrompt(true)
    const onInstalled = () => setHasNativePrompt(false)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // ── Install ─────────────────────────────────────────────────────────────────
  const handleInstall = async () => {
    if (isIOS) { setShowIOSModal(true); return }
    if (!window.deferredPrompt) { setShowAndroidModal(true); return }
    setInstalling(true)
    try {
      await window.deferredPrompt.prompt()
      const { outcome } = await window.deferredPrompt.userChoice
      if (outcome === 'accepted') window.deferredPrompt = null
    } finally {
      setInstalling(false)
    }
  }

  // ── Notification handlers ───────────────────────────────────────────────────
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
    playGoalSound()
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200])

    const iconUrl = BASE + 'icons/icon-192.png'
    const title = '⚽ هدف! — اختبار إشعار كأس العالم 2026'
    const opts = {
      body: 'نجح الاختبار! هكذا ستظهر إشعارات الأهداف والمباريات على شاشتك حتى عند إغلاق التطبيق.',
      icon: iconUrl, badge: iconUrl,
      dir: 'rtl', lang: 'ar',
      tag: 'wc-test-goal', renotify: true,
      vibrate: [100, 50, 100, 50, 200],
    }
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        await reg.showNotification(title, opts)
      } else {
        new Notification(title, opts)
      }
      setTestStatus('ok')
    } catch {
      try {
        navigator.serviceWorker?.controller?.postMessage({ type: 'SHOW_NOTIFICATION', title, body: opts.body, tag: 'wc-test-goal', vibrate: opts.vibrate })
        setTestStatus('ok')
      } catch { setTestStatus('denied') }
    }
    setTimeout(() => setTestStatus(null), 4000)
  }

  const notifStatusLabel = { granted: '✅ مفعّلة', denied: '🚫 محظورة', default: '🔕 غير مفعّلة' }[notifPerm] ?? '🔕 غير مفعّلة'
  const notifStatusColor = { granted: 'text-emerald-400', denied: 'text-red-400', default: 'text-amber-400' }[notifPerm] ?? 'text-amber-400'

  return (
    <div className="px-4 py-4 pb-24 space-y-4">

      {/* ── Favorite Teams ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">⭐ المنتخبات المفضلة</h3>
        {favoriteTeams?.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {favoriteTeams.map(teamId => {
              const team = data.teams.find(t => t.id === teamId)
              if (!team) return null
              return (
                <div key={teamId} className="flex items-center gap-2 bg-slate-700/50 rounded-xl px-3 py-2">
                  <span className="text-2xl">{team.flag}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{team.name}</p>
                    <p className="text-xs text-slate-500">المجموعة {team.group}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-sm mb-3">لم تختر منتخبات — تتابع جميع المنتخبات</p>
        )}
        <button
          onClick={onChangeFavorite}
          className="w-full py-2.5 bg-slate-700/80 border border-slate-600/50 text-white text-sm font-bold rounded-xl hover:bg-slate-600/80 transition-colors"
        >
          {favoriteTeams?.length > 0 ? 'تعديل المنتخبات المفضلة' : 'اختيار المنتخبات المفضلة'}
        </button>
        {favoriteTeams?.length > 0 && (
          <p className="text-xs text-emerald-400/70 text-center mt-2">
            ستصلك إشعارات المباريات قبل ساعة، وقبل 10 دقائق، وعند الانطلاق
          </p>
        )}
      </div>

      {/* ── Download APK / Install ── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #3730a3 100%)',
          border: '2px solid rgba(129,140,248,0.4)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
        }}
      >
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="text-5xl mb-2">📲</div>
          <h2 className="text-lg font-black text-white mb-1">
            {isInstalled ? '✅ التطبيق مثبت' : 'نزّل تطبيق أندرويد APK'}
          </h2>
          <p className="text-indigo-200 text-sm">
            {isInstalled
              ? 'تستمتع بتجربة كاملة مع إشعارات في الخلفية'
              : 'إشعارات الأهداف الفورية • صوت وارتجاج • يعمل بدون إنترنت'}
          </p>
        </div>
        <div className="px-4 pb-5 space-y-2.5">
          {/* Primary: APK download */}
          <a
            href={`${BASE}FIFAWKPRTNH2026.apk`}
            download="FIFAWKPRTNH2026.apk"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '1rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
              color: 'white',
              fontWeight: 900,
              fontSize: '1.05rem',
              textDecoration: 'none',
            }}
          >
            ⬇️ تنزيل APK أندرويد
          </a>
          <p className="text-center text-indigo-300/60 text-xs">
            فعّل "مصادر غير معروفة" في إعدادات الهاتف قبل التثبيت
          </p>

          {/* Secondary: PWA install */}
          {!isInstalled && !isIOS && (
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full py-2.5 rounded-xl font-bold text-indigo-300 text-sm transition-all active:scale-95 border border-indigo-500/30 disabled:opacity-50"
              style={{ background: 'rgba(99,102,241,0.1)' }}
            >
              {installing ? '⏳ جاري التثبيت...' : 'أو أضف إلى الشاشة الرئيسية (PWA)'}
            </button>
          )}
          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="w-full py-2.5 rounded-xl font-bold text-indigo-300 text-sm border border-indigo-500/30"
              style={{ background: 'rgba(99,102,241,0.1)' }}
            >
              📲 تثبيت على iPhone عبر Safari
            </button>
          )}
        </div>
      </div>

      {/* ── Real Test Notification ── */}
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
              testStatus === 'ok' ? 'linear-gradient(135deg, #10b981, #059669)'
              : testStatus === 'denied' ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 6px 24px rgba(245,158,11,0.35)',
          }}
        >
          {testStatus === 'sending' && '⏳ جاري الإرسال...'}
          {testStatus === 'ok' && '✅ وصل الإشعار بنجاح!'}
          {testStatus === 'denied' && '🚫 الإشعارات محظورة — افتح إعدادات المتصفح'}
          {!testStatus && '📳 اختبار إشعار الشاشة والصوت الآن'}
        </button>
        {notifPerm !== 'granted' && !testStatus && (
          <p className="text-center text-amber-400/70 text-xs mt-2">سيُطلب منك السماح بالإشعارات عند الضغط</p>
        )}
      </div>

      {/* ── Notifications ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">🔔 إعدادات الإشعارات</h3>
        <div className="flex items-center justify-between mb-3 bg-slate-700/30 rounded-xl px-3 py-2">
          <span className="text-slate-300 text-sm">حالة الإشعارات</span>
          <span className={`text-sm font-bold ${notifStatusColor}`}>{notifStatusLabel}</span>
        </div>
        {/* Open notification permission modal */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('wc-show-notif-prompt'))}
          className="w-full py-3 rounded-xl font-bold text-white text-sm mb-3 transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #b91c1c 100%)',
            boxShadow: '0 0 18px rgba(239,68,68,0.45)',
            border: '2px solid rgba(252,165,165,0.4)',
          }}
        >
          🔔 نافذة تفعيل الإشعارات
        </button>
        {notifPerm === 'granted' && (
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl px-3 py-2 mb-3 space-y-1 text-xs text-slate-400">
            <p>⏰ إشعار قبل المباراة بـ <span className="text-emerald-400 font-bold">ساعة كاملة</span></p>
            <p>⏰ إشعار قبل المباراة بـ <span className="text-emerald-400 font-bold">10 دقائق</span></p>
            <p>🎺 إشعار عند <span className="text-emerald-400 font-bold">صافرة الانطلاق</span></p>
          </div>
        )}
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
        {!firstFavTeam ? (
          <p className="text-amber-400 text-xs text-center py-2">اختر منتخباً مفضلاً أولاً لتفعيل المحاكي</p>
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
            ▶️ تشغيل وضع المحاكاة ({firstFavTeam.flag} {firstFavTeam.name})
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
                <p className="text-xs text-emerald-400">{s.capacity.toLocaleString('en-US')} مقعد</p>
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
            { label: 'نتائج المباريات', src: 'openfootball / GitHub', active: sources?.scores },
            { label: 'ترتيب المجموعات', src: 'محسوب محلياً من النتائج', active: true },
            { label: 'أخبار عاجلة', src: 'BBC / Sky / Reddit WC', active: sources?.news },
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
            آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA-u-nu-latn')} — يتجدد كل 60 ثانية
          </p>
        )}
        <button
          onClick={refresh}
          className="w-full py-2.5 bg-slate-700/80 border border-slate-600/50 text-white text-sm rounded-xl hover:bg-slate-600/80 transition-colors"
        >
          🔄 تحديث فوري
        </button>
        <p className="text-center text-slate-600 text-xs mt-2">لا يتطلب مفاتيح API أو حسابات خارجية</p>
      </div>

      {/* ── App Info ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3">📱 معلومات التطبيق</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'الإصدار', val: '5.0.0' },
            { label: 'البطولة', val: 'كأس العالم FIFA 2026' },
            { label: 'الدول المستضيفة', val: 'الولايات المتحدة • كندا • المكسيك' },
            { label: 'المنتخبات', val: `${data.teams.length} منتخب` },
            { label: 'المباريات', val: `${data.matches.length} مباراة` },
            { label: 'الملاعب', val: `${data.stadiums.length} ملعباً` },
            { label: 'منتخباتك المفضلة', val: favoriteTeams?.length > 0 ? `${favoriteTeams.length} منتخب` : 'متابعة جميع المنتخبات' },
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

      {/* ── Android Manual Install Modal ── */}
      {showAndroidModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
          onClick={() => setShowAndroidModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, #0a1628 100%)',
              border: '1.5px solid rgba(52,211,153,0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center px-6 pt-7 pb-4">
              <div className="text-6xl mb-2">📲</div>
              <h3 className="text-xl font-black text-white mb-1">تثبيت التطبيق يدوياً</h3>
            </div>
            <div className="px-5 pb-3 space-y-2.5">
              {[
                { n: '1', text: 'افتح النقاط الثلاث (⋮) في أعلى متصفح Chrome' },
                { n: '2', text: 'اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق"' },
                { n: '3', text: 'اضغط "إضافة" أو "تثبيت" للتأكيد' },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-center gap-3 bg-slate-800/70 rounded-2xl px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-black text-sm">{n}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-snug">{text}</p>
                </div>
              ))}
            </div>
            <div className="px-5 pb-6 pt-2">
              <button
                onClick={() => setShowAndroidModal(false)}
                className="w-full py-3.5 rounded-2xl font-black text-slate-900 text-sm transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 4px 16px rgba(52,211,153,0.35)' }}
              >
                فهمت، شكراً!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── iOS Install Modal ── */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, #0a1628 100%)',
              border: '1.5px solid rgba(52,211,153,0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center px-6 pt-7 pb-4">
              <div className="text-6xl mb-2">📱</div>
              <h3 className="text-xl font-black text-white mb-1">أضفه إلى شاشتك الرئيسية</h3>
              <p className="text-slate-400 text-sm">اتبع هذه الخطوات في متصفح Safari</p>
            </div>
            <div className="px-5 pb-6 space-y-2.5">
              {[
                { n: '1', color: 'bg-blue-500', icon: '⬆️', title: 'اضغط زر المشاركة', sub: 'الزر المربع بسهم للأعلى في شريط Safari السفلي' },
                { n: '2', color: 'bg-blue-500', icon: '➕', title: 'اختر "إضافة إلى الشاشة الرئيسية"', sub: 'ابحث عن الأيقونة بعلامة + في القائمة' },
                { n: '3', color: 'bg-emerald-500', icon: '✅', title: 'اضغط "إضافة" في الأعلى', sub: 'ستجد أيقونة كأس العالم على شاشتك فوراً' },
              ].map(({ n, color, icon, title, sub }) => (
                <div key={n} className="flex items-center gap-3 bg-slate-800/70 rounded-2xl px-4 py-3">
                  <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-black text-sm">{n}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold leading-tight">{title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
                  </div>
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                </div>
              ))}
              <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-2.5 text-center">
                <p className="text-amber-300 text-xs font-bold">⚠️ يجب استخدام متصفح Safari على iPhone / iPad</p>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3.5 rounded-2xl font-black text-slate-900 text-sm transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 4px 16px rgba(52,211,153,0.35)' }}
              >
                فهمت، شكراً!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
