const SESSIONS_KEY = 'rukn_sessions'
const BANNER_SHOWN_KEY = 'rukn_banner_week'

function weekKey(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // Monday as week start
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function recordSession() {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]')
  sessions.push({ ts: new Date().toISOString(), week: weekKey() })
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function checkWeeklyBanner() {
  const thisWeek = weekKey()
  const lastShown = localStorage.getItem(BANNER_SHOWN_KEY)
  if (lastShown === thisWeek) return { show: false }

  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]')

  // Count sessions from last week
  const lastWeekDate = new Date()
  lastWeekDate.setDate(lastWeekDate.getDate() - 7)
  const lastWeek = weekKey(lastWeekDate)

  const lastWeekCount = sessions.filter((s) => s.week === lastWeek).length
  if (lastWeekCount === 0) return { show: false }

  localStorage.setItem(BANNER_SHOWN_KEY, thisWeek)
  return { show: true, count: lastWeekCount }
}
