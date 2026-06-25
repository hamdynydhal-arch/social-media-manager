import { useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DailyLog } from '../types'
import { getScoreColor } from '../utils/helpers'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import clsx from 'clsx'

function calcDomainScores(log: DailyLog | undefined) {
  if (!log) return { روحي: 0, بدني: 0, عقلي: 0, نفسي: 0 }

  const prayers = log.prayers ?? []
  const habits = log.habits ?? []

  const spiritual = Math.round(
    ((prayers.filter(p => p.done).length / 5) * 60 +
    (prayers.filter(p => p.onTime).length / 5) * 20 +
    (habits.filter(h => h.domain === 'روحي' && h.done).length / Math.max(habits.filter(h => h.domain === 'روحي').length, 1)) * 20)
  )

  const physical = Math.round(
    (habits.filter(h => h.domain === 'بدني' && h.done).length / Math.max(habits.filter(h => h.domain === 'بدني').length, 1)) * 70 +
    ((log.physicalScore ?? 0) / 10) * 30
  )

  const mental = Math.round(
    (habits.filter(h => h.domain === 'عقلي' && h.done).length / Math.max(habits.filter(h => h.domain === 'عقلي').length, 1)) * 60 +
    ((log.mentalScore ?? 0) / 10) * 40
  )

  const emotional = Math.round(
    (habits.filter(h => h.domain === 'نفسي' && h.done).length / Math.max(habits.filter(h => h.domain === 'نفسي').length, 1)) * 50 +
    (['ممتاز', 'جيد'].includes(log.mood ?? '') ? 50 : log.mood === 'متوسط' ? 30 : 10)
  )

  return { روحي: spiritual, بدني: physical, عقلي: mental, نفسي: emotional }
}

export default function Performance() {
  const [logs] = useLocalStorage<Record<string, DailyLog>>('sirat-logs', {})

  const last30Days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      const key = d.toISOString().split('T')[0]
      return {
        date: d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
        score: logs[key]?.performanceScore ?? 0,
      }
    }).filter(d => d.score > 0)
  }, [logs])

  const todayKey = new Date().toISOString().split('T')[0]
  const todayLog = logs[todayKey]
  const domainScores = calcDomainScores(todayLog)

  const radarData = Object.entries(domainScores).map(([domain, value]) => ({
    domain, value
  }))

  const avg = last30Days.length > 0
    ? Math.round(last30Days.reduce((s, d) => s + d.score, 0) / last30Days.length)
    : 0

  const best = last30Days.length > 0 ? Math.max(...last30Days.map(d => d.score)) : 0

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-arabic">تحليل الأداء</h2>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'متوسط الشهر', value: avg },
          { label: 'أفضل يوم', value: best },
          { label: 'عدد الأيام', value: last30Days.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-sm">
            <p className={clsx('text-3xl font-bold', getScoreColor(value))}>{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 mb-4">تطور الأداء</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={last30Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Noto Naskh Arabic' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v) => [`${v}`, 'الأداء']}
              contentStyle={{ fontFamily: 'Noto Naskh Arabic', fontSize: '12px' }}
            />
            <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-arabic font-semibold text-gray-700 dark:text-gray-200 mb-4">توازن المحاور</h3>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="domain" tick={{ fontSize: 13, fontFamily: 'Noto Naskh Arabic', fill: '#6b7280' }} />
            <Radar dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.25} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {Object.entries(domainScores).map(([domain, value]) => (
            <div key={domain} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span className="font-arabic text-sm text-gray-600 dark:text-gray-400">{domain}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sirat-500 transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className={clsx('text-sm font-bold w-8 text-left', getScoreColor(value))}>{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
