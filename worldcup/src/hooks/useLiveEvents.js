import { useEffect, useRef } from 'react'
import data from '../data/data.json'
import { playGoalSound, playNotificationSound, playWhistleSound, haptic } from '../utils/audioUtils'
import confetti from 'canvas-confetti'

const BASE = import.meta.env.BASE_URL

/**
 * Central alert dispatcher — plays audio, fires OS notification, emits toast event.
 * type: 'goal' | 'whistle' | 'halftime' | 'fulltime' | 'warning' | 'notification'
 */
export function fireWorldCupAlert(title, body, type = 'notification') {
  // ── Audio + haptic ──────────────────────────────────────────────────
  if (type === 'goal') {
    playGoalSound()
    try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } }) } catch {}
    haptic([100, 50, 100, 50, 200])
  } else if (type === 'whistle' || type === 'halftime' || type === 'fulltime') {
    playWhistleSound()
    haptic([200, 100, 200])
  } else {
    playNotificationSound()
    haptic([50])
  }

  // ── OS / browser notification ────────────────────────────────────────
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const iconUrl = BASE + 'icons/icon-192.png'
    const opts = {
      body,
      icon: iconUrl,
      badge: iconUrl,
      dir: 'rtl',
      lang: 'ar',
      tag: type,
      renotify: true,
      vibrate: type === 'goal' ? [100, 50, 100, 50, 200] : [200],
    }
    // Use ServiceWorker.showNotification when available (works in background)
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag: type,
        vibrate: opts.vibrate,
      })
    } else {
      try { new Notification(title, opts) } catch {}
    }
  }

  // ── In-app toast via custom event ───────────────────────────────────
  const icons = {
    goal: '⚽', whistle: '🎺', halftime: '⏸️',
    fulltime: '🏁', warning: '⏰', notification: '🔔',
  }
  window.dispatchEvent(new CustomEvent('wc-alert', {
    detail: { title, body, icon: icons[type] ?? '🔔' }
  }))
}

/**
 * Hook: fires real match events for the favorite team based on wall-clock time.
 * - 15-min reminder before each scheduled match
 * - Kick-off alert when match start time arrives
 * - "Live now" alert when a live match is detected on app load
 */
export function useLiveMatchEvents(favoriteTeam) {
  const firedRef = useRef(new Set())

  useEffect(() => {
    if (!favoriteTeam || favoriteTeam === 'NONE') return

    const check = () => {
      const now = Date.now()

      data.matches.forEach(match => {
        if (match.team_home !== favoriteTeam && match.team_away !== favoriteTeam) return

        const home = data.teams.find(t => t.id === match.team_home)
        const away = data.teams.find(t => t.id === match.team_away)
        const stadium = data.stadiums.find(s => s.id === match.stadium_id)
        const matchMs = new Date(`${match.date}T${match.time}:00`).getTime()
        const diffMin = (matchMs - now) / 60000

        // 15-minute pre-match reminder (scheduled via setTimeout)
        const k15 = `${match.id}_15`
        if (diffMin > 0 && diffMin <= 16 && !firedRef.current.has(k15)) {
          firedRef.current.add(k15)
          const delay = Math.max(0, matchMs - now - 15 * 60000)
          setTimeout(() => fireWorldCupAlert(
            `⏰ تذكير: ${home?.name} ضد ${away?.name}`,
            `المباراة تبدأ خلال 15 دقيقة في ${stadium?.name ?? ''}`,
            'warning'
          ), delay)
        }

        // Kick-off alert
        const kKick = `${match.id}_kick`
        if (diffMin <= 0 && diffMin > -2 && !firedRef.current.has(kKick)) {
          firedRef.current.add(kKick)
          fireWorldCupAlert(
            `🎺 صافرة البداية! ${home?.name} ضد ${away?.name}`,
            `انطلقت المباراة في ${stadium?.city ?? ''}! 0-0`,
            'whistle'
          )
        }

        // Live match detected on load
        const kLive = `${match.id}_live`
        if (match.status === 'live' && !firedRef.current.has(kLive)) {
          firedRef.current.add(kLive)
          const score = `${match.score_home ?? 0}-${match.score_away ?? 0}`
          fireWorldCupAlert(
            `🔴 مباشر الآن! ${home?.name} ${score} ${away?.name}`,
            `الدقيقة ${match.minute ?? ''} — المباراة مستمرة في ${stadium?.city ?? ''}`,
            'whistle'
          )
        }
      })
    }

    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [favoriteTeam])
}
