import { useState, useEffect } from 'react'
import { playGoalSound, playNotificationSound, playWhistleSound, playBreakingNewsSound } from '../utils/audioUtils'
import { fireWorldCupAlert } from '../hooks/useLiveEvents'
import { useWorldCupData } from '../context/WorldCupContext'
import HeadsUpNotifModal from '../components/HeadsUpNotifModal'
import confetti from 'canvas-confetti'

const BASE = import.meta.env.BASE_URL

export default function Settings({
  favoriteTeams, onChangeFavorite,
  simRunning, onStartSim, onStopSim,
  apiMode, lastUpdated,
  installState = {},
}) {
  const { data, sources, refresh } = useWorldCupData()
  const { isInstalled, isIOS, installPrompt, triggerInstall } = installState
  const firstFavTeam = data.teams.find(t => t.id === favoriteTeams?.[0])

  const [notifPerm, setNotifPerm] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'default')
  )
  const [testStatus, setTestStatus] = useState(null)
  const [bgTestStatus, setBgTestStatus] = useState(null) // 'sending'|'sent'|'denied'|null
  const [installing, setInstalling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState(null) // 'ok' | null
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [showAndroidModal, setShowAndroidModal] = useState(false)
  const [showHeadsUpModal, setShowHeadsUpModal] = useState(false)

  // ── Install ─────────────────────────────────────────────────────────────────
  const handleInstall = async () => {
    if (isIOS) { setShowIOSModal(true); return }

    // Prompt already captured — trigger immediately
    if (installPrompt) {
      setInstalling(true)
      try { await triggerInstall() }
      finally { setInstalling(false) }
      return
    }

    // No prompt yet — wait up to 1.5 s in case Chrome fires it shortly after mount
    setInstalling(true)
    const gotPrompt = await new Promise(resolve => {
      if (window.deferredPrompt) { resolve(true); return }
      const timer = setTimeout(() => resolve(false), 1500)
      window.addEventListener('beforeinstallprompt', function handler(e) {
        e.preventDefault()
        window.deferredPrompt = e
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handler)
        resolve(true)
      })
    })
    setInstalling(false)

    if (gotPrompt && window.deferredPrompt) {
      setInstalling(true)
      try {
        await window.deferredPrompt.prompt()
        const { outcome } = await window.deferredPrompt.userChoice
        window.deferredPrompt = null
        if (outcome === 'accepted') return
      } finally {
        setInstalling(false)
      }
    }

    // Truly unavailable — show polished Chrome guide
    setShowAndroidModal(true)
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

    // Route through SW so the inline base64 icon is used (avoids white-square on Android)
    const title = '⚽ هدف! — اختبار إشعار كأس العالم 2026'
    const body  = 'نجح الاختبار! هكذا ستظهر إشعارات الأهداف والمباريات حتى عند إغلاق التطبيق.'
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag: 'wc-test-goal',
        vibrate: [100, 50, 100, 50, 200],
        requireInteraction: true,
      })
      setTestStatus('ok')
    } else {
      setTestStatus('denied')
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

      {/* ── Install ── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0f2d1f 0%, #0a1628 100%)',
          border: '1.5px solid rgba(52,211,153,0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 32px rgba(16,185,129,0.12)',
        }}
      >
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="text-5xl mb-2">📲</div>
          <h2 className="text-lg font-black text-white mb-1">
            {isInstalled ? '✅ التطبيق مثبت' : 'ثبّت التطبيق الآن!'}
          </h2>
          <p className="text-emerald-300 text-sm">
            {isInstalled
              ? 'تستمتع بتجربة كاملة مع إشعارات في الخلفية'
              : 'كأس العالم 2026 — إشعارات الأهداف الفورية'}
          </p>
        </div>
        <div className="px-4 pb-5">
          <button
            onClick={handleInstall}
            disabled={installing || isInstalled}
            className="w-full py-4 rounded-2xl font-black text-slate-900 text-base transition-all active:scale-95 disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', boxShadow: '0 6px 24px rgba(52,211,153,0.45)' }}
          >
            {isInstalled ? '✅ التطبيق مثبت بالفعل' : installing ? '⏳ جاري التثبيت...' : '📲 تثبيت التطبيق الآن'}
          </button>
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

        {/* Status row */}
        <div className="flex items-center justify-between mb-3 bg-slate-700/30 rounded-xl px-3 py-2">
          <span className="text-slate-300 text-sm">حالة الإشعارات</span>
          <span className={`text-sm font-bold ${notifStatusColor}`}>{notifStatusLabel}</span>
        </div>

        {/* Heads-up setup — primary CTA */}
        <button
          onClick={() => setShowHeadsUpModal(true)}
          className="w-full py-3.5 rounded-2xl font-black text-white text-sm mb-3 transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #1d4ed8 100%)',
            boxShadow: '0 0 22px rgba(59,130,246,0.5)',
            border: '2px solid rgba(147,197,253,0.35)',
          }}
        >
          <span className="text-xl">🔔</span>
          <span>إعداد الإشعارات الفورية فوق التطبيقات</span>
        </button>

        {notifPerm === 'granted' && (
          <>
            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl px-3 py-2 mb-3 space-y-1 text-xs text-slate-400">
              <p>⏰ إشعار قبل المباراة بـ <span className="text-emerald-400 font-bold">ساعة كاملة</span></p>
              <p>⏰ إشعار قبل المباراة بـ <span className="text-emerald-400 font-bold">10 دقائق</span></p>
              <p>🎺 إشعار عند <span className="text-emerald-400 font-bold">صافرة الانطلاق</span></p>
            </div>
            <button
              onClick={() => fireWorldCupAlert('🔔 اختبار الإشعارات', 'إشعارات كأس العالم 2026 تعمل بشكل صحيح!', 'notification')}
              className="w-full py-2.5 bg-slate-700/80 border border-slate-600/50 text-white text-sm rounded-xl hover:bg-slate-600/80 transition-colors"
            >
              🧪 إشعار داخلي تجريبي
            </button>
          </>
        )}
        {notifPerm === 'denied' && (
          <p className="text-xs text-red-400 text-center px-2">
            الإشعارات محظورة — افتح Chrome ← إعدادات ← إعدادات المواقع ← الإشعارات وأعد السماح.
          </p>
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

      {/* ── External Notification Test ── */}
      <div className="card p-4 border-red-500/30 bg-gradient-to-r from-red-900/15 to-transparent">
        <h3 className="font-bold text-white mb-1 flex items-center gap-2">🚨 اختبار الإشعار الخارجي</h3>
        <p className="text-slate-400 text-xs mb-3 leading-relaxed">
          اضغط الزر ← اضغط زر الهوم لإغلاق التطبيق ← اسحب شريط الإشعارات للأسفل ← ستجد الإشعار مع الاهتزاز والرنة
        </p>
        <button
          onClick={async () => {
            if (bgTestStatus === 'sending') return
            // Request notification permission first if needed
            if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
              const p = await Notification.requestPermission()
              if (p !== 'granted') { setBgTestStatus('denied'); setTimeout(() => setBgTestStatus(null), 4000); return }
            }
            setBgTestStatus('sending')
            // Play sound locally too
            playBreakingNewsSound()
            // Send to SW for system notification
            if (navigator.serviceWorker?.controller) {
              navigator.serviceWorker.controller.postMessage({ type: 'TEST_BREAKING_NEWS' })
              setBgTestStatus('sent')
              setTimeout(() => setBgTestStatus(null), 5000)
            } else {
              setBgTestStatus('denied')
              setTimeout(() => setBgTestStatus(null), 4000)
            }
          }}
          disabled={bgTestStatus === 'sending'}
          className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95 disabled:opacity-60"
          style={{
            background:
              bgTestStatus === 'sent'   ? 'linear-gradient(135deg, #10b981, #059669)'
              : bgTestStatus === 'denied' ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)',
            boxShadow: bgTestStatus === 'sent' ? '0 6px 24px rgba(16,185,129,0.4)' : '0 6px 24px rgba(220,38,38,0.45)',
          }}
        >
          {bgTestStatus === 'sending' && '⏳ جاري الإرسال...'}
          {bgTestStatus === 'sent'    && '✅ أُرسل! اضغط الهوم والتحقق من الإشعارات'}
          {bgTestStatus === 'denied'  && '🚫 فعّل الإشعارات أولاً في الإعدادات'}
          {!bgTestStatus              && '🚨 اختبار إشعار الأخبار العاجلة الآن'}
        </button>
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
            آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA-u-nu-latn')} — يتجدد كل دقيقتين
          </p>
        )}
        <button
          onClick={async () => {
            if (refreshing) return
            setRefreshing(true)
            setRefreshResult(null)
            await refresh()
            setRefreshing(false)
            setRefreshResult('ok')
            setTimeout(() => setRefreshResult(null), 3000)
          }}
          disabled={refreshing}
          className={`w-full py-2.5 border text-sm rounded-xl transition-all ${
            refreshResult === 'ok'
              ? 'bg-emerald-600/30 border-emerald-500/60 text-emerald-300'
              : refreshing
              ? 'bg-slate-700/50 border-slate-600/30 text-slate-400'
              : 'bg-slate-700/80 border-slate-600/50 text-white hover:bg-slate-600/80'
          }`}
        >
          {refreshing ? '⏳ جاري التحديث...' : refreshResult === 'ok' ? '✅ تم التحديث' : '🔄 تحديث فوري'}
        </button>
        <p className="text-center text-slate-600 text-xs mt-2">لا يتطلب مفاتيح API أو حسابات خارجية</p>
      </div>

      {/* ── App Info ── */}
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3">📱 معلومات التطبيق</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'الإصدار', val: '6.0.0' },
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

      {/* ── Heads-Up Notification Setup Modal ── */}
      {showHeadsUpModal && (
        <HeadsUpNotifModal
          onClose={() => setShowHeadsUpModal(false)}
          notifPerm={notifPerm}
          setNotifPerm={setNotifPerm}
        />
      )}

      {/* ── Android Chrome Install Guide ── */}
      {showAndroidModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md"
          onClick={() => setShowAndroidModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl overflow-hidden pb-safe"
            style={{
              background: 'linear-gradient(180deg, #0f2d1f 0%, #0a1628 100%)',
              border: '1.5px solid rgba(52,211,153,0.35)',
              borderBottom: 'none',
              boxShadow: '0 -16px 60px rgba(0,0,0,0.8), 0 0 40px rgba(16,185,129,0.12)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-600" />
            </div>

            <div className="text-center px-5 pt-2 pb-3">
              <div className="text-4xl mb-1">📲</div>
              <h3 className="text-lg font-black text-white">ثبّت التطبيق على هاتفك</h3>
              <p className="text-emerald-400 text-xs mt-0.5">اختر الطريقة الأسرع لك</p>
            </div>

            <div className="px-4 space-y-3 pb-4">
              {/* Method 1 — address bar icon */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(52,211,153,0.4)', background: 'rgba(16,185,129,0.08)' }}
              >
                <div className="px-3 pt-3 pb-2">
                  <p className="text-emerald-300 text-xs font-black mb-2 text-center">الطريقة الأسرع — أيقونة شريط العنوان</p>
                  {/* Chrome address bar mockup */}
                  <div
                    className="rounded-xl px-3 py-2 flex items-center gap-1.5 mb-2"
                    style={{ background: '#202124', border: '1px solid #3c4043' }}
                  >
                    <span className="text-slate-400 text-xs">🔒</span>
                    <span className="text-slate-300 text-xs flex-1 truncate font-mono">wc26.prtnh.com</span>
                    {/* Install icon indicator */}
                    <span
                      className="text-base font-black animate-pulse"
                      style={{ color: '#34d399', fontSize: '18px', lineHeight: 1 }}
                    >⊕</span>
                    <span className="text-slate-500 text-sm">⋮</span>
                  </div>
                  <p className="text-center text-white text-xs font-bold">
                    اضغط على <span className="text-emerald-400 text-base font-black">⊕</span> في شريط العنوان
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-500 text-xs">أو عبر قائمة Chrome</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              {/* Method 2 — Chrome menu */}
              <div className="space-y-1.5">
                {[
                  { n: '1', icon: '⋮', text: 'اضغط النقاط الثلاث أعلى Chrome' },
                  { n: '2', icon: '📲', text: 'اختر "تثبيت التطبيق" أو "إضافة للشاشة الرئيسية"' },
                  { n: '3', icon: '✅', text: 'اضغط "تثبيت" للتأكيد' },
                ].map(({ n, icon, text }) => (
                  <div key={n} className="flex items-center gap-2.5 bg-slate-800/60 rounded-xl px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-black text-xs">{n}</span>
                    </div>
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <p className="text-slate-300 text-sm leading-tight">{text}</p>
                  </div>
                ))}
              </div>

              {/* Reload hint */}
              <button
                onClick={() => { setShowAndroidModal(false); window.location.reload() }}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-emerald-400 transition-all active:scale-95"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}
              >
                🔄 أعد تحميل الصفحة وحاول مجدداً
              </button>

              <button
                onClick={() => setShowAndroidModal(false)}
                className="w-full py-3 rounded-2xl font-black text-slate-900 text-sm transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 4px 16px rgba(52,211,153,0.35)' }}
              >
                فهمت!
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
