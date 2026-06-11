import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import data from '../data/data.json'

export default function TeamSelector({ onSelect }) {
  const [selected, setSelected] = useState(null)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const { installPrompt, isInstalled, isIOS, triggerInstall } = useInstallPrompt()

  const handleSelect = (teamId) => {
    setSelected(teamId)
    setTimeout(() => onSelect(teamId), 300)
  }

  const handleInstall = () => {
    if (isIOS) {
      setShowIOSModal(true)
    } else if (installPrompt) {
      triggerInstall()
    } else {
      setShowIOSModal(true)
    }
  }

  const arabTeams = data.teams.filter(t => t.isArab)
  const otherTeams = data.teams.filter(t => !t.isArab)

  const TeamBtn = ({ team }) => (
    <button
      onClick={() => handleSelect(team.id)}
      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all duration-200 ${
        selected === team.id
          ? 'border-emerald-400 bg-emerald-400/10 scale-105 shadow-lg shadow-emerald-400/20'
          : 'border-slate-700/50 bg-slate-800/50 active:scale-95'
      }`}
    >
      <span className="text-3xl">{team.flag}</span>
      <span className="text-xs font-bold text-white text-center leading-tight">{team.name}</span>
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto safe-top safe-bottom">
      <div className="max-w-sm w-full mx-auto px-5 py-6">

        {/* ── زر تثبيت التطبيق ── */}
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

        {/* ── رأس الصفحة ── */}
        <div className="text-center mb-7">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-2xl font-black text-white mb-1">كأس العالم 2026</h1>
          <p className="text-slate-400 text-base font-medium">ما هو منتخبك المفضل؟</p>
          <p className="text-slate-500 text-sm mt-1">سنرتب المباريات بناءً على اختيارك</p>
        </div>

        {/* ── المنتخبات العربية ── */}
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

        {/* ── باقي المنتخبات ── */}
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
          onClick={() => onSelect('NONE')}
          className="w-full mt-2 mb-8 py-3 text-slate-500 text-sm active:text-slate-300 transition-colors"
        >
          تخطي — أتابع جميع المنتخبات
        </button>
      </div>

      {/* ── مودال تعليمات التثبيت ── */}
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
              {isIOS
                ? 'اتبع هذه الخطوات من متصفح Safari:'
                : 'اتبع هذه الخطوات من متصفح Chrome:'}
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
