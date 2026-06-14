import { useEffect, useRef } from 'react'
import data from '../data/data.json'
import { playGoalSound, playNotificationSound, playWhistleSound, haptic } from '../utils/audioUtils'
import confetti from 'canvas-confetti'
const BASE = import.meta.env.BASE_URL

// ── localStorage persistence for fired alerts (survives page refresh) ─────────
const FIRED_KEY = 'wc-fired-alerts-v1'

function hasFired(key) {
  try {
    const obj = JSON.parse(localStorage.getItem(FIRED_KEY) ?? '{}')
    const ts = obj[key]
    if (!ts) return false
    return (Date.now() - ts) < 24 * 3600_000  // valid for 24 hours
  } catch { return false }
}

function markFired(key) {
  try {
    const obj = JSON.parse(localStorage.getItem(FIRED_KEY) ?? '{}')
    obj[key] = Date.now()
    // Trim to newest 200 entries to avoid unbounded growth
    const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 200)
    localStorage.setItem(FIRED_KEY, JSON.stringify(Object.fromEntries(entries)))
  } catch {}
}

async function swNotify(title, opts) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, opts)
      return
    }
  } catch {}
  try {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION', title,
        body: opts.body, tag: opts.tag,
        vibrate: opts.vibrate, requireInteraction: opts.requireInteraction,
      })
      return
    }
  } catch {}
  try { new Notification(title, opts) } catch {}
}

export function fireWorldCupAlert(title, body, type = 'notification', isFav = false) {
  if (type === 'goal') {
    playGoalSound()
    try { confetti({ particleCount: isFav ? 200 : 100, spread: 70, origin: { y: 0.6 } }) } catch {}
    haptic(isFav ? [100, 50, 100, 50, 200, 50, 200] : [100, 50, 100, 50, 200])
  } else if (['whistle', 'halftime', 'fulltime'].includes(type)) {
    playWhistleSound()
    haptic([200, 100, 200])
  } else {
    playNotificationSound()
    haptic(isFav ? [100, 50, 100] : [50])
  }

  const iconUrl = BASE + 'icons/icon-192.png'
  const vibrate = type === 'goal'
    ? (isFav ? [100, 50, 100, 50, 200, 50, 200] : [100, 50, 100, 50, 200])
    : [200, 100, 200]

  swNotify(title, {
    body, icon: iconUrl, badge: iconUrl, dir: 'rtl', lang: 'ar',
    tag: type + (isFav ? '-fav' : ''),
    renotify: true, vibrate,
    requireInteraction: true,
    silent: false,
  })

  const icons = { goal: '⚽', whistle: '🎺', halftime: '⏸️', fulltime: '🏁', warning: '⏰', notification: '🔔' }
  window.dispatchEvent(new CustomEvent('wc-alert', {
    detail: { title, body, icon: icons[type] ?? '🔔', isFav }
  }))
}

async function ensureNotificationPermission() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'default') return
  try { await Notification.requestPermission() } catch {}
}

export function useLiveMatchEvents(favoriteTeams) {
  const scheduledRef = useRef(new Set())  // in-memory: prevents duplicate timers this session
  const teamsKey = JSON.stringify(favoriteTeams)

  useEffect(() => {
    const teams    = Array.isArray(favoriteTeams) ? favoriteTeams : []
    const watchAll = teams.length === 0

    const check = () => {
      const now = Date.now()

      data.matches.forEach(match => {
        if (!watchAll && !teams.includes(match.team_home) && !teams.includes(match.team_away)) return

        const home    = data.teams.find(t => t.id === match.team_home)
        const away    = data.teams.find(t => t.id === match.team_away)
        const stadium = data.stadiums.find(s => s.id === match.stadium_id)
        const matchMs = new Date(`${match.date}T${match.time}:00Z`).getTime()
        const diffMin = (matchMs - now) / 60_000

        const favNames = watchAll
          ? `${home?.name ?? match.team_home} / ${away?.name ?? match.team_away}`
          : teams.filter(id => id === match.team_home || id === match.team_away)
              .map(id => data.teams.find(t => t.id === id)?.name).filter(Boolean).join(' / ')

        const scheduleAlert = (key, threshMin) => {
          if (hasFired(key) || scheduledRef.current.has(key)) return
          scheduledRef.current.add(key)
          ensureNotificationPermission()
          const delay = Math.max(0, matchMs - now - threshMin * 60_000)
          setTimeout(() => {
            // Calculate actual remaining time at the moment of firing
            const remMin = Math.max(1, Math.round((matchMs - Date.now()) / 60_000))
            const timeLabel =
              remMin >= 55 ? 'ساعة' :
              remMin >= 25 ? 'نصف ساعة' :
              `${remMin} دقيقة`
            const title = `⏰ ${timeLabel} على الانطلاق! ${home?.name} ضد ${away?.name}`
            const body  = `${favNames} | ${stadium?.city ?? ''} — ${remMin} دقيقة ⚽📺`
            markFired(key)
            fireWorldCupAlert(title, body, 'warning', true)
          }, delay)
        }

        // ── 60-min reminder (fires when diffMin in 10..61) ──────────────────
        if (diffMin > 30 && diffMin <= 61) scheduleAlert(`${match.id}_60`, 60)

        // ── 30-min reminder (fires when diffMin in 10..31) ──────────────────
        if (diffMin > 10 && diffMin <= 31) scheduleAlert(`${match.id}_30`, 30)

        // ── 10-min reminder ──────────────────────────────────────────────────
        if (diffMin > 0 && diffMin <= 11)  scheduleAlert(`${match.id}_10`, 10)

        // ── Kickoff ──────────────────────────────────────────────────────────
        const kKick = `${match.id}_kick`
        if (diffMin <= 0 && diffMin > -2 && !hasFired(kKick) && !scheduledRef.current.has(kKick)) {
          scheduledRef.current.add(kKick)
          markFired(kKick)
          fireWorldCupAlert(
            `🔴 صافرة البداية! ${home?.flag ?? ''}${home?.name} ضد ${away?.flag ?? ''}${away?.name}`,
            `${favNames} | ${stadium?.city ?? ''} — 0-0 الآن! 🎺`,
            'whistle', true
          )
        }

        // ── Live on load ─────────────────────────────────────────────────────
        const kLive = `${match.id}_live`
        if (match.status === 'live' && !hasFired(kLive) && !scheduledRef.current.has(kLive)) {
          scheduledRef.current.add(kLive)
          markFired(kLive)
          fireWorldCupAlert(
            `🔴 مباشر! ${home?.flag ?? ''}${home?.name} ${match.score_home ?? 0}-${match.score_away ?? 0} ${away?.name}${away?.flag ?? ''}`,
            `${favNames} | د.${match.minute ?? ''} | ${stadium?.city ?? ''}`,
            'whistle', true
          )
        }
      })
    }

    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamsKey])
}

export function useGoalDetection(matches, favoriteTeams) {
  const prevRef = useRef(null)
  const favKey  = JSON.stringify(favoriteTeams)

  useEffect(() => {
    if (!Array.isArray(matches) || !matches.length) return

    const teams    = Array.isArray(favoriteTeams) ? favoriteTeams : []
    const watchAll = teams.length === 0

    const snapshot = {}
    matches.forEach(m => {
      if (m.status === 'live' || m.status === 'finished') {
        snapshot[m.id] = { home: Number(m.score_home ?? 0), away: Number(m.score_away ?? 0) }
      }
    })

    if (prevRef.current === null) { prevRef.current = snapshot; return }

    const prev = prevRef.current

    matches.forEach(m => {
      if (m.status !== 'live' && m.status !== 'finished') return
      const prevSnap = prev[m.id] ?? { home: 0, away: 0 }
      const currHome = Number(m.score_home ?? 0)
      const currAway = Number(m.score_away ?? 0)
      if (currHome === prevSnap.home && currAway === prevSnap.away) return

      const homeTeam = data.teams.find(t => t.id === m.team_home)
      const awayTeam = data.teams.find(t => t.id === m.team_away)

      if (currHome > prevSnap.home) {
        const isFavScorer = watchAll || teams.includes(m.team_home)
        fireWorldCupAlert(
          `🚨⚽ هدف! ${homeTeam?.flag ?? ''}${homeTeam?.name} ${currHome}-${currAway} ${awayTeam?.name ?? ''}`,
          `د.${m.minute ?? '؟'} | ${isFavScorer ? '⭐ منتخبك يسجل!' : 'هدف في كأس العالم'}`,
          'goal', isFavScorer
        )
      }

      if (currAway > prevSnap.away) {
        const isFavScorer = watchAll || teams.includes(m.team_away)
        fireWorldCupAlert(
          `🚨⚽ هدف! ${homeTeam?.name ?? ''} ${currHome}-${currAway} ${awayTeam?.flag ?? ''}${awayTeam?.name ?? ''}`,
          `د.${m.minute ?? '؟'} | ${isFavScorer ? '⭐ منتخبك يسجل!' : 'هدف في كأس العالم'}`,
          'goal', isFavScorer
        )
      }
    })

    prevRef.current = snapshot
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, favKey])
}
