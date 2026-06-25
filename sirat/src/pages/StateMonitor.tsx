import { useLocalStorage } from '../hooks/useLocalStorage'
import { DailyLog, Mood, EnergyLevel } from '../types'
import { todayKey, DEFAULT_PRAYERS, DEFAULT_HABITS, calcPerformanceScore } from '../utils/helpers'
import clsx from 'clsx'

const MOODS: { value: Mood; emoji: string; color: string }[] = [
  { value: 'ممتاز', emoji: '😁', color: 'border-green-400 bg-green-50 dark:bg-green-900/30' },
  { value: 'جيد',   emoji: '🙂', color: 'border-teal-400 bg-teal-50 dark:bg-teal-900/30'  },
  { value: 'متوسط', emoji: '😐', color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' },
  { value: 'ضعيف', emoji: '😔', color: 'border-orange-400 bg-orange-50 dark:bg-orange-900/30' },
  { value: 'سيء',   emoji: '😞', color: 'border-red-400 bg-red-50 dark:bg-red-900/30'  },
]

const SCORES = [
  { label: 'التركيز الذهني', key: 'mentalScore' },
  { label: 'الحالة البدنية', key: 'physicalScore' },
] as const

export default function StateMonitor() {
  const today = todayKey()
  const [logs, setLogs] = useLocalStorage<Record<string, DailyLog>>('sirat-logs', {})

  const todayLog: DailyLog = logs[today] ?? {
    date: today,
    prayers: DEFAULT_PRAYERS.map(p => ({ ...p })),
    habits: DEFAULT_HABITS.map(h => ({ ...h })),
    mood: null,
    energy: null,
    physicalScore: null,
    mentalScore: null,
    note: '',
    performanceScore: 0,
  }

  function save(updated: Partial<DailyLog>) {
    const newLog = { ...todayLog, ...updated }
    newLog.performanceScore = calcPerformanceScore(newLog)
    setLogs(prev => ({ ...prev, [today]: newLog }))
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-arabic">متابعة الحالة</h2>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 text-lg mb-4">كيف حالك اليوم؟</h3>
        <div className="flex gap-3 flex-wrap">
          {MOODS.map(({ value, emoji, color }) => (
            <button
              key={value}
              onClick={() => save({ mood: value })}
              className={clsx(
                'flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 transition-all hover:scale-105',
                todayLog.mood === value ? color + ' border-opacity-100' : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="font-arabic text-sm text-gray-700 dark:text-gray-300">{value}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 text-lg mb-4">مستوى الطاقة</h3>
        <div className="flex gap-3">
          {([1, 2, 3, 4, 5] as EnergyLevel[]).map(level => (
            <button
              key={level}
              onClick={() => save({ energy: level })}
              className={clsx(
                'flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all',
                todayLog.energy === level
                  ? 'border-sirat-500 bg-sirat-500 text-white'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-sirat-300'
              )}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-xs text-gray-400 font-arabic">منهك</span>
          <span className="text-xs text-gray-400 font-arabic">طاقة عالية</span>
        </div>
      </section>

      {SCORES.map(({ label, key }) => (
        <section key={key} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 text-lg">{label}</h3>
            <span className="text-sirat-600 font-bold">{todayLog[key] ?? 0} / 10</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={todayLog[key] ?? 0}
            onChange={e => save({ [key]: Number(e.target.value) })}
            className="w-full accent-sirat-500 h-2"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400 font-arabic">0</span>
            <span className="text-xs text-gray-400 font-arabic">10</span>
          </div>
        </section>
      ))}

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 text-lg mb-3">محاسبة النفس</h3>
        <div className="space-y-3">
          {[
            'ما أفضل شيء فعلته اليوم؟',
            'ما الذي أتمنى لو فعلته بشكل مختلف؟',
            'ماذا أشكر الله عليه اليوم؟',
          ].map((q, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic mb-2">{q}</p>
              <textarea
                className="w-full bg-transparent text-gray-700 dark:text-gray-200 font-arabic text-sm resize-none focus:outline-none"
                rows={2}
                dir="rtl"
                placeholder="اكتب هنا..."
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
