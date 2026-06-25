import { useLocalStorage } from '../hooks/useLocalStorage'
import { DailyLog } from '../types'
import { todayKey, DEFAULT_PRAYERS, DEFAULT_HABITS, calcPerformanceScore } from '../utils/helpers'
import { CheckCircle2, Circle } from 'lucide-react'
import clsx from 'clsx'

export default function DailyRoutine() {
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

  function togglePrayer(id: string, field: 'done' | 'onTime') {
    const prayers = todayLog.prayers.map(p =>
      p.id === id ? { ...p, [field]: !p[field], done: field === 'onTime' ? true : !p.done } : p
    )
    save({ prayers })
  }

  function toggleHabit(id: string) {
    const habits = todayLog.habits.map(h => h.id === id ? { ...h, done: !h.done } : h)
    save({ habits })
  }

  const prayersDone = todayLog.prayers.filter(p => p.done).length

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-arabic">الروتين اليومي</h2>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 text-lg">الصلوات</h3>
          <span className="text-sm font-arabic text-sirat-600 dark:text-sirat-400">{prayersDone} / 5</span>
        </div>
        <div className="space-y-3">
          {todayLog.prayers.map(prayer => (
            <div key={prayer.id} className={clsx(
              'flex items-center justify-between p-4 rounded-xl border transition-all',
              prayer.done ? 'border-sirat-300 bg-sirat-50 dark:bg-sirat-900/30 dark:border-sirat-700' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30'
            )}>
              <button onClick={() => togglePrayer(prayer.id, 'done')} className="flex items-center gap-3">
                {prayer.done
                  ? <CheckCircle2 size={22} className="text-sirat-500" />
                  : <Circle size={22} className="text-gray-400" />}
                <span className={clsx('font-arabic font-medium', prayer.done ? 'text-sirat-700 dark:text-sirat-300' : 'text-gray-600 dark:text-gray-400')}>
                  {prayer.name}
                </span>
              </button>
              {prayer.done && (
                <button
                  onClick={() => togglePrayer(prayer.id, 'onTime')}
                  className={clsx(
                    'text-xs font-arabic px-3 py-1 rounded-full border transition-all',
                    prayer.onTime ? 'bg-gold-400 text-white border-gold-400' : 'border-gray-300 text-gray-500 dark:border-gray-600'
                  )}
                >
                  {prayer.onTime ? '⭐ في وقتها' : 'في وقتها؟'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 text-lg mb-4">العادات اليومية</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {todayLog.habits.map(habit => (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={clsx(
                'flex items-center gap-4 p-4 rounded-xl border text-right transition-all hover:scale-[1.01]',
                habit.done
                  ? 'border-sirat-300 bg-sirat-50 dark:bg-sirat-900/30 dark:border-sirat-700'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30'
              )}
            >
              <span className="text-2xl">{habit.icon}</span>
              <div className="flex-1 text-right">
                <p className={clsx('font-arabic font-medium text-sm', habit.done ? 'text-sirat-700 dark:text-sirat-300' : 'text-gray-700 dark:text-gray-300')}>
                  {habit.name}
                </p>
                <p className="text-xs text-gray-400 font-arabic">{habit.target} {habit.unit} · {habit.domain}</p>
              </div>
              {habit.done
                ? <CheckCircle2 size={20} className="text-sirat-500 shrink-0" />
                : <Circle size={20} className="text-gray-300 shrink-0" />}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 text-lg mb-3">ملاحظة اليوم</h3>
        <textarea
          value={todayLog.note}
          onChange={e => save({ note: e.target.value })}
          placeholder="اكتب ما تريد تذكره عن هذا اليوم..."
          className="w-full h-28 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-arabic text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sirat-400"
          dir="rtl"
        />
      </section>
    </div>
  )
}
