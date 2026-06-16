import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import data from '../data/data.json'

export default function TeamSelector({ onSelect, initialSelected = [] }) {
  const [selected, setSelected] = useState(() => new Set(initialSelected))
  const [showIOSModal, setShowIOSModal] = useState(false)
  const { isInstalled, isIOS, triggerInstall } = useInstallPrompt()

  const toggle = (teamId) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(teamId)) next.delete(teamId)
      else next.add(teamId)
      return next
    })
  }

  const handleConfirm = () => onSelect([...selected])
  const handleSkip    = () => onSelect([])

  const handleInstall = () => {
    if (isIOS) setShowIOSModal(true)
    else if (triggerInstall) triggerInstall()
    else setShowIOSModal(true)
  }

  const arabTeams  = data.teams.filter(t => t.isArab)
  const otherTeams = data.teams.filter(t => !t.isArab)
  const count      = selected.size

  const TeamBtn = ({ team }) => {
    const isSel = selected.has(team.id)
    return (
      <button
        onClick={() => toggle(team.id)}
        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all duration-200 relative ${
          isSel
            ? 'border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-400/20'
            : 'border-slate-700/50 bg-slate-800/50 active:scale-95'
        }`}
      >
        {isSel && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center text-slate-900 text-xs font-black">
            ✓
          </span>
        )}
        <span className="text-3xl">{team.flag}</span>
        <span className="text-xs font-bold text-white text-center leading-tight">{team.name}</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto safe-top safe-bottom">
      <div className="max-w-sm w-full mx-auto px-5 py-6 pb-40">

        {!isInstalled && (
          <button
            onClick={handleInstall}
            className="w-full mb-5 py-4 px-5 rounded-2xl font-bold text-white text-base shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}
          >
            <span className="text-xl">📲</span>
            <span>تثبيت التطبيق على الهاتف</span>
          </button>
        )}

        <div className="text-center mb-7">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-2xl font-black text-white mb-1">كأس العالم 2026</h1>
          <p className="text-slate-400 text-base font-medium">اختر منتخباتك المفضلة</p>
          <p className="text-slate-500 text-sm mt-1">يمكنك اختيار أكثر من منتخب — ستصلك إشعارات مباراتهم</p>
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-base">🌙</span>
            <h2 className="text-sm font-bold text-emerald-400 tracking-wide">المنتخبات العربية</h2>
            <span className="text-xs text-slate-500">({arabTeams.length} منتخب)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {arabTeams.map(team => <TeamBtn key={team.id} team={team} />)}
          </div>
        </div>

        <div className="border-t border-slate-800/60 my-5" />

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-base">🌍</span>
            <h2 className="text-sm font-bold text-slate-400 tracking-wide">باقي المنتخبات</h2>
            <span className="text-xs text-slate-500">({otherTeams.length} منتخب)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {otherTeams.map(team => <TeamBtn key={team.id} team={team} />)}
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="w-full mt-2 mb-8 py-3 text-slate-500 text-sm active:text-slate-300 transition-colors"
        >
          تخطي — أتابع جميع المنتخبات
        </button>
      </div>

      {/* ── Fixed confirm bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-60 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-5 py-4 safe-bottom">
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl font-black text-slate-900 text-base transition-all active:scale-95"
          style={{
            background: count > 0
              ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
              : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
            boxShadow: count > 0 ? '0 4px 20px rgba(52,211,153,0.5)' : 'none',
          }}
        >
          {count > 0
            ? `✅ تأكيد اختيار ${count} منتخب${count === 1 ? '' : count < 11 ? '' : 'اً'}`
            : '⬆️ اختر منتخباً واحداً على الأقل'}
        </button>
      </div>

      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full bg-slate-800 rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-5" />
            <h3 className="text-xl font-bold text-white text-center mb-1">تثبيت التطبيق 📲</h3>
            <p className="text-slate-400 text-center text-sm mb-5">
              {isIOS ? 'اتبع هذه الخطوات من متصفح Safari:' : 'اتبع هذه الخطوات من متصفح Chrome:'}
            </p>
            <div className="space-y-3">
              {(isIOS ? [
                { icon: '1️⃣', text: 'افتح الرابط في متصفح Safari' },
                { icon: '2️⃣', text: 'اضغط زر المشاركة (□↑) في أسفل الشاشة' },
                { icon: '3️⃣', text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
                { icon: '4️⃣', text: 'اضغط "إضافة" في الزاوية اليمنى العليا' },
              ] : [
                { icon: '1️⃣', text: 'افتح الرابط في متصفح Chrome' },
                { icon: '2️⃣', text: 'اضغط النقاط الثلاث (⋮) في أعلى الشاشة' },
                { icon: '3️⃣', text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
                { icon: '4️⃣', text: 'اضغط "إضافة" لتأكيد التثبيت' },
              ]).map((step, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3">
                  <span className="text-2xl">{step.icon}</span>
                  <p className="text-white text-sm font-medium">{step.text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 py-3 rounded-xl bg-emerald-500 font-bold text-white active:bg-emerald-600 transition-colors"
            >
              فهمت، شكراً!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
