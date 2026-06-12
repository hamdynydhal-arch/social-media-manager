import { useEffect, useRef } from 'react'
import data from '../data/data.json'
import { playGoalSound, playNotificationSound, playWhistleSound, haptic } from '../utils/audioUtils'
import confetti from 'canvas-confetti'

const BASE = import.meta.env.BASE_URL

/**
 * Show a system notification via ServiceWorker.showNotification() for maximum
 * background delivery (bypasses the postMessage path, lives in the SW directly).
 * Falls back to postMessage then new Notification().
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
    try { confetti({ particleCount: isFav ? 200 : 120, spread: 70, origin: { y: 0.6 } }) } catch {}
    haptic(isFav ? [100, 50, 100, 50, 200, 50, 200] : [100, 50, 100, 50, 200])
  } else if (['whistle', 'halftime', 'fulltime'].includes(type)) {
    playWhistleSound()
    haptic([200, 100, 200])
  } else {
    playNotificationSound()
    haptic(isFav ? [100, 50, 100] : [50])
  }

  // ── System notification via SW ──────────────────────────────────────────────
  const iconUrl = BASE + 'icons/icon-192.png'
  const vibrate = type === 'goal'
    ? (isFav ? [100, 50, 100, 50, 200, 50, 200] : [100, 50, 100, 50, 200])
    : [200]

  swNotify(title, {
    body,
    icon: iconUrl,
    badge: iconUrl,
    dir: 'rtl',
    lang: 'ar',
    tag: type + (isFav ? '-fav' : ''),
    renotify: true,
    vibrate,
    requireInteraction: isFav,   // ← stay visible until user dismisses
    silent: false,
  })

  // ── In-app toast ────────────────────────────────────────────────────────────
  const icons = {
    goal: '⚽', whistle: '🎺', halftime: '⏸️',
    fulltime: '🏁', warning: '⏰', notification: '🔔',
  }
  window.dispatchEvent(new CustomEvent('wc-alert', {
    detail: { title, body, icon: icons[type] ?? '🔔', isFav }
  }))
}

/**
 * Hook: schedules match notifications for every team in favoriteTeams[].
 * - 60 minutes before → reminder
 * - 10 minutes before → "get ready"
 * - At kickoff        → whistle alert
 * - Live on load      → live score alert
 *
 * Each notification uses reg.showNotification() so it survives foreground→background.
 * requireInteraction:true keeps fav-team notifications on screen until dismissed.
 */
export function useLiveMatchEvents(favoriteTeams) {
  const firedRef = useRef(new Set())
  const teamsKey  = JSON.stringify(favoriteTeams)

  useEffect(() => {
    const teams = Array.isArray(favoriteTeams) ? favoriteTeams : []
    if (teams.length === 0) return

    const check = () => {
      const now = Date.now()

      data.matches.forEach(match => {
        if (!teams.includes(match.team_home) && !teams.includes(match.team_away)) return

        const home    = data.teams.find(t => t.id === match.team_home)
        const away    = data.teams.find(t => t.id === match.team_away)
        const stadium = data.stadiums.find(s => s.id === match.stadium_id)
        const matchMs = new Date(`${match.date}T${match.time}:00Z`).getTime()
        const diffMin = (matchMs - now) / 60_000

        const favNames = teams
          .filter(id => id === match.team_home || id === match.team_away)
          .map(id => data.teams.find(t => t.id === id)?.name)
          .filter(Boolean)
          .join(' / ')

        // ── 60-min reminder ─────────────────────────────────────────────────
        const k60 = `${match.id}_60`
        if (diffMin > 10 && diffMin <= 61 && !firedRef.current.has(k60)) {
          firedRef.current.add(k60)
          const delay = Math.max(0, matchMs - now - 60 * 60_000)
          setTimeout(() => fireWorldCupAlert(
            `🚨 ساعة على الانطلاق! ${home?.name} ضد ${away?.name}`,
            `${favNames} | ${stadium?.city ?? ''} — استعد! 📺`,
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
