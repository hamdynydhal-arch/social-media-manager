import { useEffect, useRef } from 'react'
import data from '../data/data.json'
import { playGoalSound, playNotificationSound, playWhistleSound, haptic } from '../utils/audioUtils'
import confetti from 'canvas-confetti'

const BASE = import.meta.env.BASE_URL

/**
 * Central alert dispatcher.
 * isFav=true applies extra vibration and a bigger confetti burst.
 */
export function fireWorldCupAlert(title, body, type = 'notification', isFav = false) {
  // ── Audio + haptic ──────────────────────────────────────────────────
  if (type === 'goal') {
    playGoalSound()
    try { confetti({ particleCount: isFav ? 200 : 120, spread: 70, origin: { y: 0.6 } }) } catch {}
    haptic(isFav ? [100, 50, 100, 50, 200, 50, 200] : [100, 50, 100, 50, 200])
  } else if (type === 'whistle' || type === 'halftime' || type === 'fulltime') {
    playWhistleSound()
    haptic([200, 100, 200])
  } else {
    playNotificationSound()
    haptic(isFav ? [100, 50, 100] : [50])
  }

  // ── OS / browser notification ────────────────────────────────────────
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const iconUrl = BASE + 'icons/icon-192.png'
    const vibrate = type === 'goal'
      ? (isFav ? [100, 50, 100, 50, 200, 50, 200] : [100, 50, 100, 50, 200])
      : [200]
    const opts = {
      body,
      icon: iconUrl,
      badge: iconUrl,
      dir: 'rtl',
      lang: 'ar',
      tag: type + (isFav ? '-fav' : ''),
      renotify: true,
      vibrate,
    }
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag: opts.tag,
        vibrate,
      })
    } else {
      try { new Notification(title, opts) } catch {}
    }
  }

  // ── In-app toast ─────────────────────────────────────────────────────
  const icons = {
    goal: '⚽', whistle: '🎺', halftime: '⏸️',
    fulltime: '🏁', warning: '⏰', notification: '🔔',
  }
  window.dispatchEvent(new CustomEvent('wc-alert', {
    detail: { title, body, icon: icons[type] ?? '🔔', isFav }
  }))
}

/**
 * Hook: fires match notifications for all favorite teams.
 * Reminders at −60 min, −10 min, and at kickoff.
 * favoriteTeams: string[] (array of team IDs, e.g. ['MEX','ARG'])
 */
export function useLiveMatchEvents(favoriteTeams) {
  const firedRef = useRef(new Set())
  const teamsKey = JSON.stringify(favoriteTeams)

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
        const matchMs = new Date(`${match.date}T${match.time}:00`).getTime()
        const diffMin = (matchMs - now) / 60000

        // Which of the user's favorites are playing?
        const favPlaying = teams
          .filter(id => id === match.team_home || id === match.team_away)
          .map(id => data.teams.find(t => t.id === id)?.name)
          .filter(Boolean)
          .join(' / ')

        // ── 60-minute reminder ────────────────────────────────────────
        const k60 = `${match.id}_60`
        if (diffMin > 10 && diffMin <= 61 && !firedRef.current.has(k60)) {
          firedRef.current.add(k60)
          const delay = Math.max(0, matchMs - now - 60 * 60_000)
          setTimeout(() => fireWorldCupAlert(
            `⭐ ساعة على انطلاق ${home?.name} ضد ${away?.name}!`,
            `${favPlaying} يلعب خلال ساعة في ${stadium?.name ?? ''} — استعد للمتابعة!`,
            'warning', true
          ), delay)
        }

        // ── 10-minute reminder ────────────────────────────────────────
        const k10 = `${match.id}_10`
        if (diffMin > 0 && diffMin <= 11 && !firedRef.current.has(k10)) {
          firedRef.current.add(k10)
          const delay = Math.max(0, matchMs - now - 10 * 60_000)
          setTimeout(() => fireWorldCupAlert(
            `⭐ 10 دقائق على انطلاق ${home?.name} ضد ${away?.name}!`,
            `استعد! ${favPlaying} يلعب خلال 10 دقائق في ${stadium?.city ?? ''}! ⚽`,
            'warning', true
          ), delay)
        }

        // ── Kickoff ───────────────────────────────────────────────────
        const kKick = `${match.id}_kick`
        if (diffMin <= 0 && diffMin > -2 && !firedRef.current.has(kKick)) {
          firedRef.current.add(kKick)
          fireWorldCupAlert(
            `🎺⭐ صافرة البداية! ${home?.name} ضد ${away?.name}`,
            `انطلقت مباراة ${favPlaying} الآن في ${stadium?.city ?? ''}! 0-0`,
            'whistle', true
          )
        }

        // ── Live on app load ──────────────────────────────────────────
        const kLive = `${match.id}_live`
        if (match.status === 'live' && !firedRef.current.has(kLive)) {
          firedRef.current.add(kLive)
          const score = `${match.score_home ?? 0}-${match.score_away ?? 0}`
          fireWorldCupAlert(
            `🔴⭐ مباشر الآن! ${home?.name} ${score} ${away?.name}`,
            `مباراة ${favPlaying} مستمرة — الدقيقة ${match.minute ?? ''} في ${stadium?.city ?? ''}`,
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
