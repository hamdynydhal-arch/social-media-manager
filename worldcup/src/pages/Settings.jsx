import data from '../data/data.json'
import { playGoalSound, playNotificationSound, playWhistleSound } from '../utils/audioUtils'
import confetti from 'canvas-confetti'

export default function Settings({ favoriteTeam, onChangeFavorite }) {
  const favTeam = data.teams.find(t => t.id === favoriteTeam)

  const testGoalFX = () => {
    playGoalSound()
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200])
  }

  return (
    <div className="px-4 py-4 pb-24 space-y-4">
      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">⭐ المنتخب المفضل</h3>
        {favTeam ? (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{favTeam.flag}</span>
            <div>
              <p className="font-bold text-white">{favTeam.name}</p>
              <p className="text-xs text-slate-400">المدرب: {favTeam.coach}</p>
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

      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">🔊 اختبار المؤثرات الصوتية</h3>
        <div className="space-y-2">
          {[
            { label: '⚽ صوت الهدف + احتفال', fn: testGoalFX },
            { label: '🔔 صوت الإشعار', fn: playNotificationSound },
            { label: '⚽ صافرة الحكم', fn: playWhistleSound },
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

      <div className="card p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">🏟️ الملاعب</h3>
        <div className="space-y-3">
          {data.stadiums.map(s => (
            <div key={s.id} className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-3">
              <span className="text-2xl">🏟️</span>
              <div>
                <p className="font-bold text-white text-sm">{s.name}</p>
                <p className="text-xs text-slate-400">{s.city}، {s.country}</p>
                <p className="text-xs text-emerald-400">{s.capacity.toLocaleString('ar-SA')} مقعد • {s.surface}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-bold text-white mb-3">📱 معلومات التطبيق</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'الإصدار', val: '1.0.0' },
            { label: 'البطولة', val: 'كأس العالم FIFA 2026' },
            { label: 'الدول المستضيفة', val: 'الولايات المتحدة • كندا • المكسيك' },
            { label: 'المنتخبات', val: `${data.teams.length} منتخب` },
            { label: 'المباريات', val: `${data.matches.length} مباراة` },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between">
              <span className="text-slate-400">{label}</span>
              <span className="text-white font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 border-emerald-500/20 bg-gradient-to-r from-emerald-900/20 to-transparent">
        <p className="text-center text-slate-400 text-sm">
          🏆 كأس العالم 2026 — متابع من كل مكان
        </p>
        <p className="text-center text-slate-500 text-xs mt-1">
          يعمل بدون إنترنت • إشعارات فورية • RTL عربي
        </p>
      </div>
    </div>
  )
}
