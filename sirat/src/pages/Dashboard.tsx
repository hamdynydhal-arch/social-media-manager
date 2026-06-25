import { useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DailyLog } from '../types'
import { todayKey, formatArabicDate, getScoreColor, getScoreBg, DEFAULT_PRAYERS, DEFAULT_HABITS } from '../utils/helpers'
import { Flame, Star, Moon, Heart } from 'lucide-react'
import clsx from 'clsx'

function ScoreRing({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1a3a2a" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <span className={clsx('text-3xl font-bold', getScoreColor(score))}>{score}</span>
        <span className="block text-xs text-gray-400 font-arabic">من 100</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const today = todayKey()
  const [logs] = useLocalStorage<Record<string, DailyLog>>('sirat-logs', {})
  const todayLog = logs[today]

  const streak = useMemo(() => {
    let count = 0
    const d = new Date()
    while (true) {
      const key = d.toISOString().split('T')[0]
      const log = logs[key]
      if (!log || log.performanceScore < 50) break
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  }, [logs])

  const lastSevenDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const key = d.toISOString().split('T')[0]
      return { key, score: logs[key]?.performanceScore ?? 0, day: d.toLocaleDateString('ar-SA', { weekday: 'short' }) }
    })
  }, [logs])

  const score = todayLog?.performanceScore ?? 0
  const prayersDone = todayLog?.prayers?.filter(p => p.done).length ?? 0
  const habitsDone = todayLog?.habits?.filter(h => h.done).length ?? 0
  const totalHabits = DEFAULT_HABITS.length
  const totalPrayers = DEFAULT_PRAYERS.length

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-arabic">أهلاً بك في سِراطك</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-arabic mt-1">{formatArabicDate(today)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400 font-arabic text-sm">أداء اليوم</p>
          <ScoreRing score={score} />
          <p className={clsx('font-arabic font-semibold text-lg', getScoreColor(score))}>
            {score >= 80 ? 'ممتاز 🌟' : score >= 60 ? 'جيد 👍' : score >= 40 ? 'متوسط ⚡' : 'يحتاج جهداً 💪'}
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <StatCard icon={<Flame className="text-orange-500" size={22} />} label="سلسلة الأيام" value={`${streak} يوم`} color="bg-orange-50 dark:bg-orange-900/20" />
          <StatCard icon={<Moon className="text-indigo-500" size={22} />} label="الصلوات" value={`${prayersDone} / ${totalPrayers}`} color="bg-indigo-50 dark:bg-indigo-900/20" />
          <StatCard icon={<Star className="text-gold-500" size={22} />} label="العادات" value={`${habitsDone} / ${totalHabits}`} color="bg-yellow-50 dark:bg-yellow-900/20" />
          <StatCard icon={<Heart className="text-red-500" size={22} />} label="الحالة" value={todayLog?.mood ?? '—'} color="bg-red-50 dark:bg-red-900/20" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 mb-4">الأسبوع الماضي</h3>
        <div className="flex items-end gap-2 h-28">
          {lastSevenDays.map(({ key, score: s, day }) => (
            <div key={key} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{s > 0 ? s : ''}</span>
              <div
                className={clsx('w-full rounded-t-lg transition-all duration-500', getScoreBg(s), s === 0 && 'bg-gray-200 dark:bg-gray-700')}
                style={{ height: `${Math.max(s, 4)}%` }}
              />
              <span className="text-xs text-gray-500 font-arabic">{day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-sirat-950 dark:bg-sirat-900 rounded-2xl p-6 text-center">
        <p className="text-gold-300 font-arabic text-lg leading-relaxed">
          ﴿ وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ﴾
        </p>
        <p className="text-sirat-400 text-xs mt-2 font-arabic">الطلاق: 2-3</p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={clsx('rounded-2xl p-4 flex flex-col gap-2', color)}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-gray-600 dark:text-gray-300 text-sm font-arabic">{label}</span>
      </div>
      <span className="text-2xl font-bold text-gray-800 dark:text-white font-arabic">{value}</span>
    </div>
  )
}
