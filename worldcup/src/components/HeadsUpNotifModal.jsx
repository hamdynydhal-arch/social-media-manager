import { useState } from 'react'

// Sends a test notification through the SW so it uses the inline base64 icon
function sendTestViaSwAsync() {
  return new Promise(resolve => {
    if (!navigator.serviceWorker?.controller) { resolve(false); return }
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title: '⚽ اختبار — كأس العالم 2026',
      body: 'اضغط مطولاً على هذا الإشعار ← اختر «تنبيه» لظهوره فوق التطبيقات',
      tag: 'wc-headsup-test-' + Date.now(),
      vibrate: [300, 100, 300, 100, 800],
      requireInteraction: true,
    })
    resolve(true)
  })
}

export default function HeadsUpNotifModal({ onClose, notifPerm, setNotifPerm }) {
  const [phase, setPhase]       = useState(notifPerm === 'granted' ? 'guide' : 'permission')
  const [permLoading, setPermLoading] = useState(false)
  const [testSent, setTestSent] = useState(false)

  // ── Request permission then advance ──────────────────────────────────
  const handleRequestPerm = async () => {
    if (typeof Notification === 'undefined') return
    setPermLoading(true)
    const result = await Notification.requestPermission()
    setNotifPerm(result)
    setPermLoading(false)
    if (result === 'granted') setPhase('guide')
  }

  // ── Send test notification ────────────────────────────────────────────
  const handleSendTest = async () => {
    const ok = await sendTestViaSwAsync()
    if (ok) setTestSent(true)
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-3xl overflow-hidden pb-safe"
        style={{
          background: 'linear-gradient(180deg, #0d1f38 0%, #090f1e 100%)',
          border: '1.5px solid rgba(96,165,250,0.35)',
          borderBottom: 'none',
          boxShadow: '0 -16px 60px rgba(0,0,0,0.85), 0 0 40px rgba(59,130,246,0.15)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="text-center px-5 pt-2 pb-4">
          <div className="text-4xl mb-2">🔔</div>
          <h3 className="text-lg font-black text-white leading-tight">
            إشعارات فورية فوق التطبيقات
          </h3>
          <p className="text-blue-300 text-xs mt-1">
            اتبع الخطوات لتفعيل الظهور العاجل على شاشتك
          </p>
        </div>

        <div className="px-4 pb-6 space-y-4">

          {/* ── Phase: permission needed ── */}
          {phase === 'permission' && (
            <div className="space-y-3">
              <div className="bg-amber-900/25 border border-amber-500/30 rounded-2xl p-4">
                <p className="text-amber-300 font-bold text-sm mb-1">الخطوة الأولى: السماح بالإشعارات</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  يحتاج التطبيق إذن الإشعارات ليتمكن من إعلامك بالأهداف والأخبار العاجلة حتى وأنت في تطبيق آخر.
                </p>
              </div>

              {notifPerm === 'denied' ? (
                <div className="space-y-3">
                  <div className="bg-red-900/25 border border-red-500/30 rounded-2xl p-4">
                    <p className="text-red-400 font-bold text-sm mb-1">🚫 الإشعارات محظورة</p>
                    <p className="text-slate-400 text-xs leading-relaxed mb-3">
                      سبق وضغطت «حظر» في Chrome. لإعادة التفعيل:
                    </p>
                    <div className="space-y-2">
                      {[
                        { n: '1', text: 'افتح Chrome ← النقاط الثلاث ⋮ ← الإعدادات' },
                        { n: '2', text: 'إعدادات المواقع ← الإشعارات' },
                        { n: '3', text: 'ابحث عن wc26.prtnh.com ← السماح' },
                      ].map(({ n, text }) => (
                        <div key={n} className="flex gap-2.5 items-start">
                          <div className="w-5 h-5 rounded-full bg-red-700/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-black">{n}</span>
                          </div>
                          <p className="text-slate-300 text-xs leading-snug">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-2xl font-black text-slate-300 text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    إغلاق
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRequestPerm}
                  disabled={permLoading}
                  className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95 disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    boxShadow: '0 6px 24px rgba(59,130,246,0.45)',
                  }}
                >
                  {permLoading ? '⏳ جاري الطلب...' : '🔔 السماح بالإشعارات'}
                </button>
              )}
            </div>
          )}

          {/* ── Phase: guide ── */}
          {phase === 'guide' && (
            <div className="space-y-4">

              {/* Step A — send test notification */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: testSent ? '1.5px solid rgba(52,211,153,0.5)' : '1.5px solid rgba(96,165,250,0.4)',
                  background: testSent ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)',
                }}
              >
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                    style={{ background: testSent ? '#10b981' : '#3b82f6', color: 'white' }}
                  >
                    {testSent ? '✓' : '1'}
                  </div>
                  <p className={`font-bold text-sm ${testSent ? 'text-emerald-300' : 'text-blue-300'}`}>
                    {testSent ? 'تم إرسال الإشعار ✅' : 'أرسل إشعاراً تجريبياً'}
                  </p>
                </div>
                <div className="px-4 pb-3">
                  {!testSent ? (
                    <>
                      <p className="text-slate-400 text-xs mb-3 leading-relaxed">
                        سيصلك إشعار فوري — هذا يتيح لك ضبط إعداداته مباشرةً.
                      </p>
                      <button
                        onClick={handleSendTest}
                        className="w-full py-3 rounded-xl font-black text-white text-sm transition-all active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
                        }}
                      >
                        📳 أرسل الإشعار التجريبي الآن
                      </button>
                    </>
                  ) : (
                    <p className="text-emerald-400/80 text-xs leading-relaxed">
                      ابحث عن الإشعار في الشريط العلوي واتبع الخطوات أدناه 👇
                    </p>
                  )}
                </div>
              </div>

              {/* Steps B/C/D — always visible, highlighted after test sent */}
              <div className="space-y-2">
                {[
                  {
                    n: '2',
                    icon: '✋',
                    title: 'اضغط مطولاً على الإشعار',
                    desc: 'افتح شريط الإشعارات من أعلى الشاشة واضغط طويلاً على إشعار كأس العالم',
                    highlight: testSent,
                  },
                  {
                    n: '3',
                    icon: '⚙️',
                    title: 'اضغط أيقونة الإعدادات',
                    desc: 'ستظهر أيقونة ترس ⚙️ على يسار الإشعار — اضغط عليها',
                    highlight: testSent,
                  },
                  {
                    n: '4',
                    icon: '🔔',
                    title: 'اختر «تنبيه» أو «عاجل»',
                    desc: 'غيّر مستوى الأهمية من «صامت» أو «افتراضي» إلى «تنبيه» أو «عاجل» — سيظهر الإشعار فوق أي تطبيق مفتوح',
                    highlight: testSent,
                    important: true,
                  },
                ].map(({ n, icon, title, desc, highlight, important }) => (
                  <div
                    key={n}
                    className="flex gap-3 items-start rounded-2xl px-3 py-3 transition-all"
                    style={{
                      background: important && highlight
                        ? 'rgba(220,38,38,0.12)'
                        : highlight
                        ? 'rgba(59,130,246,0.08)'
                        : 'rgba(255,255,255,0.04)',
                      border: important && highlight
                        ? '1px solid rgba(239,68,68,0.35)'
                        : highlight
                        ? '1px solid rgba(96,165,250,0.25)'
                        : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm mt-0.5"
                      style={{
                        background: important && highlight ? '#dc2626' : highlight ? '#3b82f6' : '#334155',
                        color: 'white',
                      }}
                    >
                      {n}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-lg leading-none">{icon}</span>
                        <p className={`font-bold text-sm ${important && highlight ? 'text-red-300' : highlight ? 'text-blue-200' : 'text-slate-300'}`}>
                          {title}
                        </p>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alternative: Chrome menu path */}
              <details className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <summary
                  className="px-4 py-3 text-slate-400 text-xs cursor-pointer select-none flex items-center gap-2"
                  style={{ listStyle: 'none' }}
                >
                  <span>▸</span>
                  <span>طريقة بديلة: عبر إعدادات Chrome</span>
                </summary>
                <div className="px-4 pb-4 pt-2 space-y-2">
                  {[
                    { n: '1', text: 'افتح Chrome ← ⋮ النقاط الثلاث ← إعدادات' },
                    { n: '2', text: 'إعدادات المواقع ← الإشعارات' },
                    { n: '3', text: 'ابحث عن wc26.prtnh.com' },
                    { n: '4', text: 'اضبط الأهمية على «عاجل» أو «تنبيه»' },
                  ].map(({ n, text }) => (
                    <div key={n} className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-black">{n}</span>
                      </div>
                      <p className="text-slate-400 text-xs leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </details>

              {/* Done button */}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-black text-slate-900 text-base transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                  boxShadow: '0 6px 24px rgba(52,211,153,0.4)',
                }}
              >
                ✅ فهمت — تم الإعداد
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
