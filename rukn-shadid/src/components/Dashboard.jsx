import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import content from '../content.json'
import { getSessionData } from '../utils/silentTracker'

const FEAR_LABELS = {
  fear:   'الخوف من الأذى',
  burden: 'ثقل التعامل',
  vague:  'التوقع السيّئ',
}

// ─── Bar (horizontal) ─────────────────────────────────────────────────────────
function HBar({ label, count, total, delay }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-teal-500 opacity-70">{count}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(45,212,191,0.08)' }}>
        <motion.div
          className="h-1.5 rounded-full"
          style={{ background: 'rgba(45,212,191,0.55)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  )
}

// ─── Day bars (vertical) ──────────────────────────────────────────────────────
function DayBars({ sessions }) {
  const dayLabels = content.dashboard_day_labels
  const counts = Array(7).fill(0)
  sessions.forEach((s) => {
    if (s.dow !== undefined) counts[s.dow]++
  })
  const max = Math.max(...counts, 1)

  return (
    <div className="flex gap-1.5 items-end" style={{ height: 56 }}>
      {counts.map((c, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            className="w-full rounded-sm"
            style={{
              background: c > 0 ? 'rgba(45,212,191,0.45)' : 'rgba(45,212,191,0.07)',
              minHeight: 2,
            }}
            initial={{ height: 2 }}
            animate={{ height: Math.max(2, (c / max) * 48) }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.04, ease: [0.4, 0, 0.2, 1] }}
          />
          <span className="text-gray-700" style={{ fontSize: 10 }}>{dayLabels[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Hour Distribution ─────────────────────────────────────────────────────────
function TimeDistribution({ sessions }) {
  const slots = [
    { label: 'فجر', hours: [4, 5, 6] },
    { label: 'صباح', hours: [7, 8, 9, 10, 11] },
    { label: 'ظهر', hours: [12, 13, 14] },
    { label: 'عصر', hours: [15, 16, 17] },
    { label: 'مساء', hours: [18, 19, 20, 21] },
    { label: 'ليل', hours: [22, 23, 0, 1, 2, 3] },
  ]
  const counts = slots.map((s) => ({
    ...s,
    count: sessions.filter((sess) => s.hours.includes(sess.hour)).length,
  }))
  const max = Math.max(...counts.map((c) => c.count), 1)

  return (
    <div className="flex gap-1.5 items-end" style={{ height: 40 }}>
      {counts.map((s, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            className="w-full rounded-sm"
            style={{
              background: s.count > 0 ? 'rgba(45,212,191,0.38)' : 'rgba(45,212,191,0.06)',
              minHeight: 2,
            }}
            initial={{ height: 2 }}
            animate={{ height: Math.max(2, (s.count / max) * 32) }}
            transition={{ duration: 0.7, delay: 0.5 + i * 0.06, ease: [0.4, 0, 0.2, 1] }}
          />
          <span className="text-gray-700" style={{ fontSize: 9 }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ onClose }) {
  const sessions = useMemo(() => getSessionData(), [])
  const total = sessions.length

  const fearCounts = useMemo(() => {
    const c = { fear: 0, burden: 0, vague: 0 }
    sessions.forEach((s) => { if (s.fear && c[s.fear] !== undefined) c[s.fear]++ })
    return c
  }, [sessions])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#000' }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
      exit={{ opacity: 0, y: 30, transition: { duration: 0.35 } }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-10 pb-4">
        <h1 className="text-teal-300 text-base tracking-widest opacity-70">
          {content.dashboard_title}
        </h1>
        <button
          onClick={onClose}
          className="text-gray-600 text-sm hover:text-gray-400 transition-colors"
        >
          {content.dashboard_close}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10">
        {total === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4, transition: { delay: 0.3 } }}
            className="text-center text-sm text-gray-500 leading-loose mt-20 whitespace-pre-line"
          >
            {content.dashboard_empty}
          </motion.p>
        ) : (
          <div className="flex flex-col gap-8 max-w-sm mx-auto">

            {/* Therapeutic message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.7 } }}
              className="rounded-2xl px-5 py-4"
              style={{ background: 'rgba(10,30,28,0.7)', border: '1px solid rgba(45,212,191,0.15)' }}
            >
              <p className="text-sm text-gray-300 leading-loose text-center">
                تُثبت بياناتك الواقعية أنك أكملت{' '}
                <span className="text-teal-300">{total}</span>{' '}
                {total === 1 ? 'جلسة' : 'جلسات'}، ومرّت جميعها بسلام.
                <br />
                <span className="text-gray-500 text-xs">
                  مخاوفك أنماط متكررة وليست تنبؤات حقيقية.
                </span>
              </p>
            </motion.div>

            {/* Fear distribution */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.6 } }}
            >
              <p className="text-xs text-gray-600 mb-3 tracking-wider">توزيع المخاوف</p>
              <div className="flex flex-col gap-3">
                {Object.entries(FEAR_LABELS).map(([id, label], i) => (
                  <HBar
                    key={id}
                    label={label}
                    count={fearCounts[id]}
                    total={total}
                    delay={0.4 + i * 0.1}
                  />
                ))}
              </div>
            </motion.section>

            {/* Day of week */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.6 } }}
            >
              <p className="text-xs text-gray-600 mb-3 tracking-wider">أيام الأسبوع</p>
              <DayBars sessions={sessions} />
            </motion.section>

            {/* Time of day */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.65, duration: 0.6 } }}
            >
              <p className="text-xs text-gray-600 mb-3 tracking-wider">أوقات اليوم</p>
              <TimeDistribution sessions={sessions} />
            </motion.section>

            {/* Total counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25, transition: { delay: 0.8 } }}
              className="text-center"
            >
              <span className="text-xs text-gray-600" style={{ direction: 'ltr' }}>
                {total} sessions recorded
              </span>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
