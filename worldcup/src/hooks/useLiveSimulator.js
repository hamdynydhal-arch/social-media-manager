import { useState, useRef, useEffect, useCallback } from 'react'
import data from '../data/data.json'
import { fireWorldCupAlert } from './useLiveEvents'

const STEP_MS = 10000 // 10 seconds per event

/**
 * Hook: simulates a full match for the favorite team, firing realistic
 * live-match alerts every 10 seconds to demo the notification system.
 */
export function useLiveSimulator(favoriteTeam) {
  const [running, setRunning] = useState(false)
  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const stopSim = useCallback(() => {
    clearTimers()
    setRunning(false)
  }, [])

  const startSim = useCallback(() => {
    if (!favoriteTeam || favoriteTeam === 'NONE') return
    clearTimers()

    // Pick the first match that involves the favorite team
    const match = data.matches.find(m =>
      m.team_home === favoriteTeam || m.team_away === favoriteTeam
    )
    if (!match) return

    const home = data.teams.find(t => t.id === match.team_home)
    const away = data.teams.find(t => t.id === match.team_away)
    const hn = home?.name ?? 'المضيف'
    const an = away?.name ?? 'الضيف'
    const isFavHome = match.team_home === favoriteTeam

    // Mutable score counters shared across closures
    let sh = 0, sa = 0

    const script = [
      // Step 0 — pre-match reminder
      () => fireWorldCupAlert(
        `⏰ تذكير: ${hn} ضد ${an}`,
        'المباراة تبدأ خلال 15 دقيقة! استعد للمتابعة!',
        'warning'
      ),
      // Step 1 — kick-off
      () => fireWorldCupAlert(
        `🎺 صافرة البداية! ${hn} ضد ${an}`,
        'انطلقت المباراة! النتيجة الآن 0-0',
        'whistle'
      ),
      // Step 2 — first goal (for the favorite team)
      () => {
        if (isFavHome) sh++; else sa++
        fireWorldCupAlert(
          `⚽ هدف لـ ${isFavHome ? hn : an}!`,
          `${hn} ${sh}-${sa} ${an} — ما أجمل هذا الهدف!`,
          'goal'
        )
      },
      // Step 3 — halftime
      () => fireWorldCupAlert(
        `⏸️ نهاية الشوط الأول — ${hn} ضد ${an}`,
        `نتيجة الشوط الأول: ${hn} ${sh}-${sa} ${an}`,
        'halftime'
      ),
      // Step 4 — second half start
      () => fireWorldCupAlert(
        `🎺 بداية الشوط الثاني — ${hn} ضد ${an}`,
        'استأنفت المباراة! هل تستمر الريادة؟',
        'whistle'
      ),
      // Step 5 — second goal (favorite team)
      () => {
        if (isFavHome) sh++; else sa++
        fireWorldCupAlert(
          `⚽ هدف ثانٍ رائع لـ ${isFavHome ? hn : an}!`,
          `${hn} ${sh}-${sa} ${an} — النتيجة شبه محسومة!`,
          'goal'
        )
      },
      // Step 6 — full time
      () => fireWorldCupAlert(
        `🏁 صافرة النهاية! ${hn} ${sh}-${sa} ${an}`,
        `انتهت المباراة بنتيجة نهائية ${hn} ${sh}-${sa} ${an}. تهانينا! 🎉`,
        'fulltime'
      ),
    ]

    setRunning(true)

    script.forEach((fn, i) => {
      timers.current.push(setTimeout(fn, i * STEP_MS))
    })

    // Auto-stop after last event
    timers.current.push(
      setTimeout(() => setRunning(false), script.length * STEP_MS + 1000)
    )
  }, [favoriteTeam])

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [])

  return { running, startSim, stopSim }
}
