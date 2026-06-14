import { useEffect, useRef } from 'react'
import data from '../data/data.json'
import { playGoalSound, playNotificationSound, playWhistleSound, haptic } from '../utils/audioUtils'
import confetti from 'canvas-confetti'
const BASE = import.meta.env.BASE_URL

/**
 * Show a system notification via ServiceWorker.showNotification() for native
 * phone delivery (notification shade, lock screen, sound).
 * Falls back to postMessage → new Notification().
 */
async function swNotify(title, opts) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, opts)
      return
    }
  } catch { /* fall through */ }
  try {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body: opts.body,
        tag: opts.tag,
        vibrate: opts.vibrate,
        requireInteraction: opts.requireInteraction,
      })
      return
    }
  } catch { /* fall through */ }
  try { new Notification(title, opts) } catch { /* ignored */ }
}

/**
 * Central alert dispatcher.
 * type: 'goal' | 'whistle' | 'halftime' | 'fulltime' | 'warning' | 'notification'
 * isFav: true → extra vibration, bigger confetti, requireInteraction
 */
export function fireWorldCupAlert(title, body, type = 'notification', isFav = false) {
  // ── Audio + haptic ──────────────────────────────────────────────────────────
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

  // ── Native OS notification via SW (appears on phone screen even when app is background) ──
  const iconUrl = BASE + 'icons/icon-192.png'
  const vibrate = type === 'goal'
    ? (isFav ? [100, 50, 100, 50, 200, 50, 200] : [100, 50, 100, 50, 200])
    : [200, 100, 200]

  swNotify(title, {
    body,
    icon:               iconUrl,
    badge:              iconUrl,
    dir:                'rtl',
    lang:               'ar',
    tag:                type + (isFav ? '-fav' : ''),
    renotify:           true,
    vibrate,
    requireInteraction: true,   // always stay visible until user dismisses
    silent:             false,
  })

  // ── In-app red toast ────────────────────────────────────────────────────────
  const icons = {
    goal: '⚽', whistle: '🎺', halftime: '⏸️',
    fulltime: '🏁', warning: '⏰', notification: '🔔',
  }
  window.dispatchEvent(new CustomEvent('wc-alert', {
    detail: { title, body, icon: icons[type] ?? '🔔', isFav }
  }))
}

/**
 * Request notification permission proactively when a match is imminent.
 * Only prompts if permission is still 'default' (not yet decided by user).
 */
async function ensureNotificationPermission() {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'default') return
  try { await Notification.requestPermission() } catch { /* ignore */ }
}

/**
 * Schedules match notifications for all followed matches:
 *   - 60 min before  → reminder
 *   - 30 min before  → "نصف ساعة" warning     ← NEW
 *   - 10 min before  → "استعد"
 *   - At kickoff     → whistle alert
 *   - Live on load   → live score alert
 *
 * favoriteTeams = []  → "watch all" mode: every WC match triggers alerts
 * favoriteTeams = [...] → only matches involving those teams
 */
export function useLiveMatchEvents(favoriteTeams) {
  const firedRef = useRef(new Set())
  const teamsKey = JSON.stringify(favoriteTeams)

  useEffect(() => {
    const teams    = Array.isArray(favoriteTeams) ? favoriteTeams : []
    const watchAll = teams.length === 0   // [] = watch all WC matches

    const check = () => {
      const now = Date.now()

      data.matches.forEach(match => {
        // Skip matches not involving followed teams (unless watch-all mode)
        if (!watchAll && !teams.includes(match.team_home) && !teams.includes(match.team_away)) return

        const home    = data.teams.find(t => t.id === match.team_home)
        const away    = data.teams.find(t => t.id === match.team_away)
        const stadium = data.stadiums.find(s => s.id === match.stadium_id)
        const matchMs = new Date(`${match.date}T${match.time}:00Z`).getTime()
        const diffMin = (matchMs - now) / 60_000

        const favNames = watchAll
          ? `${home?.name ?? match.team_home} / ${away?.name ?? match.team_away}`
          : teams
              .filter(id => id === match.team_home || id === match.team_away)
              .map(id => data.teams.find(t => t.id === id)?.name)
              .filter(Boolean)
              .join(' / ')

        // ── 60-min reminder ─────────────────────────────────────────────────
        const k60 = `${match.id}_60`
        if (diffMin > 30 && diffMin <= 61 && !firedRef.current.has(k60)) {
          firedRef.current.add(k60)
          ensureNotificationPermission()
          const delay = Math.max(0, matchMs - now - 60 * 60_000)
          setTimeout(() => fireWorldCupAlert(
            `🚨 ساعة على الانطلاق! ${home?.name} ضد ${away?.name}`,
            `${favNames} | ${stadium?.city ?? ''} — استعد! 📺`,
            'warning', true
          ), delay)
        }

        // ── 30-min reminder ─────────────────────────────────────────────────
        const k30 = `${match.id}_30`
        if (diffMin > 10 && diffMin <= 31 && !firedRef.current.has(k30)) {
          firedRef.current.add(k30)
          ensureNotificationPermission()
          const delay = Math.max(0, matchMs - now - 30 * 60_000)
          setTimeout(() => fireWorldCupAlert(
            `⏰ نصف ساعة على الانطلاق! ${home?.name} ضد ${away?.name}`,
            `${favNames} | ${stadium?.city ?? ''} — 30 دقيقة ⚽📺`,
            'warning', true
          ), delay)
        }

        // ── 10-min reminder ─────────────────────────────────────────────────
        const k10 = `${match.id}_10`
        if (diffMin > 0 && diffMin <= 11 && !firedRef.current.has(k10)) {
          firedRef.current.add(k10)
          const delay = Math.max(0, matchMs - now - 10 * 60_000)
          setTimeout(() => fireWorldCupAlert(
            `🚨 استعد! 10 دقائق | ${home?.name} ضد ${away?.name}`,
            `${favNames} | ${stadium?.city ?? ''} — 10 دقائق ⚽`,
            'warning', true
          ), delay)
        }

        // ── Kickoff ─────────────────────────────────────────────────────────
        const kKick = `${match.id}_kick`
        if (diffMin <= 0 && diffMin > -2 && !firedRef.current.has(kKick)) {
          firedRef.current.add(kKick)
          fireWorldCupAlert(
            `🔴 صافرة البداية! ${home?.flag ?? ''}${home?.name} ضد ${away?.flag ?? ''}${away?.name}`,
            `${favNames} | ${stadium?.city ?? ''} — 0-0 الآن! 🎺`,
            'whistle', true
          )
        }

        // ── Live on load ────────────────────────────────────────────────────
        const kLive = `${match.id}_live`
        if (match.status === 'live' && !firedRef.current.has(kLive)) {
          firedRef.current.add(kLive)
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

/**
 * Detects live score changes and fires goal notifications.
 * Fires for ALL live matches — favorite-team goals get louder treatment.
 * First run seeds scores without triggering alerts (prevents false alerts on load).
 */
export function useGoalDetection(matches, favoriteTeams) {
  const prevRef = useRef(null)
  const favKey  = JSON.stringify(favoriteTeams)

  useEffect(() => {
    if (!Array.isArray(matches) || !matches.length) return

    const teams    = Array.isArray(favoriteTeams) ? favoriteTeams : []
    const watchAll = teams.length === 0

    // Build snapshot of current live/finished scores for ALL matches
    const snapshot = {}
    matches.forEach(m => {
      if (m.status === 'live' || m.status === 'finished') {
        snapshot[m.id] = { home: Number(m.score_home ?? 0), away: Number(m.score_away ?? 0) }
      }
    })

    if (prevRef.current === null) {
      prevRef.current = snapshot
      return // seed only — no notification on first load
    }

    const prev = prevRef.current

    matches.forEach(m => {
      // Always check all live/finished matches (not just favorites)
      if (m.status !== 'live' && m.status !== 'finished') return

      const prevSnap = prev[m.id] ?? { home: 0, away: 0 }
      const currHome = Number(m.score_home ?? 0)
      const currAway = Number(m.score_away ?? 0)

      // No change in score → skip
      if (currHome === prevSnap.home && currAway === prevSnap.away) return

      const homeTeam = data.teams.find(t => t.id === m.team_home)
      const awayTeam = data.teams.find(t => t.id === m.team_away)

      // isFav = true when the scoring team is a followed team (or watch-all mode)
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
