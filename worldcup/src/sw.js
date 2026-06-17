// v22 — PWA install only; APK removed
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event =>
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('workbox-') || (k.startsWith('wc-') && k !== 'wc-sw-state-v1'))
          .map(k => caches.delete(k))
      )
    ).then(() => clients.claim())
  )
)

// Cache Google Fonts
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31_536_000 })]
  })
)

// Derive base from service worker scope — works on any hosting (GitHub Pages, Netlify, etc.)
const BASE = self.registration.scope  // always ends with '/'
const ICON  = BASE + 'icons/icon-192.png'
const SOUND = BASE + 'sounds/whistle.wav'

const WHISTLE_VIB  = [300, 100, 300, 100, 800]
const STANDARD_VIB = [200, 100, 200]
const NEWS_VIB     = [100, 80, 100, 80, 200, 80, 500]

// Live scores source (CORS * — GitHub CDN)
const OFB_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

// ── Lightweight Cache store for SW-private state ─────────────────────────────
const SW_STATE = 'wc-sw-state-v1'

async function swGet(key) {
  const cache = await caches.open(SW_STATE)
  const res = await cache.match(`/__sw__/${key}`)
  if (!res) return null
  try { return await res.json() } catch { return null }
}

async function swSet(key, value) {
  const cache = await caches.open(SW_STATE)
  await cache.put(
    `/__sw__/${key}`,
    new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } })
  )
}

// ── Broadcast messages to all open tabs ──────────────────────────────────────
function notifyClients() {
  return clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then(list => list.forEach(c => c.postMessage({ type: 'PLAY_WHISTLE' })))
}

function notifyNewsClients() {
  return clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then(list => list.forEach(c => c.postMessage({ type: 'PLAY_BREAKING_NEWS' })))
}

// ── Background goal detection ─────────────────────────────────────────────────
async function backgroundScoreCheck() {
  const favs = (await swGet('favs')) ?? []
  if (!favs.length) return

  let data
  try {
    const res = await fetch(OFB_URL, { cache: 'no-store' })
    if (!res.ok) return
    data = await res.json()
  } catch { return }

  const prev = (await swGet('bg-scores')) ?? {}
  const next = { ...prev }

  for (const round of (data.rounds ?? [])) {
    for (const m of (round.matches ?? [])) {
      if (!m.score?.ft) continue // not finished/live yet

      // openfootball uses .code (MEX, BRA…) which matches our internal IDs
      const hCode = m.team1?.code ?? ''
      const aCode = m.team2?.code ?? ''
      if (!favs.includes(hCode) && !favs.includes(aCode)) continue

      const id = `${m.date}_${hCode}_${aCode}`
      const sh = Number(m.score.ft[0] ?? 0)
      const sa = Number(m.score.ft[1] ?? 0)
      const p  = prev[id] ?? { h: 0, a: 0 }

      next[id] = { h: sh, a: sa }

      if (sh > p.h) {
        const isFavScorer = favs.includes(hCode)
        await self.registration.showNotification(
          `🚨⚽ هدف! ${m.team1?.name} ${sh}–${sa} ${m.team2?.name}`,
          {
            body:               isFavScorer ? '⭐ منتخبك يسجل!' : 'هدف في مباراتك المفضلة',
            icon: ICON, badge: ICON, dir: 'rtl', lang: 'ar',
            tag: `bg-${id}-h${sh}`, renotify: true,
            vibrate: WHISTLE_VIB, requireInteraction: true, silent: false,
          }
        )
        notifyClients()
      }

      if (sa > p.a) {
        const isFavScorer = favs.includes(aCode)
        await self.registration.showNotification(
          `🚨⚽ هدف! ${m.team1?.name} ${sh}–${sa} ${m.team2?.name}`,
          {
            body:               isFavScorer ? '⭐ منتخبك يسجل!' : 'هدف في مباراتك المفضلة',
            icon: ICON, badge: ICON, dir: 'rtl', lang: 'ar',
            tag: `bg-${id}-a${sa}`, renotify: true,
            vibrate: WHISTLE_VIB, requireInteraction: true, silent: false,
          }
        )
        notifyClients()
      }
    }
  }

  await swSet('bg-scores', next)
}

const DATA_JSON = BASE + 'data.json'

async function backgroundPreMatchCheck() {
  let schedData
  try {
    const res = await fetch(DATA_JSON, { cache: 'no-store', signal: AbortSignal.timeout(8000) })
    if (!res.ok) return
    schedData = await res.json()
  } catch { return }

  const matches = schedData.matches ?? []
  const teams   = schedData.teams   ?? []
  const now     = Date.now()
  const fired   = (await swGet('pre-match-v1')) ?? {}
  let changed   = false

  for (const m of matches) {
    const matchMs = new Date(`${m.date}T${m.time}:00Z`).getTime()
    const diffMin = (matchMs - now) / 60_000
    if (diffMin < -5 || diffMin > 75) continue  // outside any alert window

    const home = teams.find(t => t.id === m.team_home)
    const away = teams.find(t => t.id === m.team_away)
    const label = `${home?.name ?? m.team_home} ضد ${away?.name ?? m.team_away}`
    const remMin = Math.max(1, Math.round(diffMin))

    const THRESHOLDS = [
      { key: `${m.id}_60`, min: 50, max: 70, label: 'ساعة' },
      { key: `${m.id}_30`, min: 20, max: 40, label: 'نصف ساعة' },
      { key: `${m.id}_10`, min:  5, max: 15, label: '10 دقائق' },
      { key: `${m.id}_kick`, min: -5, max: 5, label: 'صافرة البداية' },
    ]

    for (const t of THRESHOLDS) {
      if (diffMin < t.min || diffMin > t.max) continue
      if (fired[t.key]) continue

      fired[t.key] = now
      changed = true

      const isKick = t.key.endsWith('_kick')
      await self.registration.showNotification(
        isKick
          ? `🔴 صافرة البداية! ${label}`
          : `⏰ ${t.label} على الانطلاق! ${label}`,
        {
          body:               isKick
            ? `${home?.flag ?? ''}${home?.name} vs ${away?.flag ?? ''}${away?.name} — الآن!`
            : `${home?.flag ?? ''}${home?.name} vs ${away?.flag ?? ''}${away?.name} — ${remMin} دقيقة`,
          icon:               ICON,
          badge:              ICON,
          dir:                'rtl',
          lang:               'ar',
          tag:                t.key,
          renotify:           true,
          vibrate:            isKick ? WHISTLE_VIB : STANDARD_VIB,
          requireInteraction: true,
          silent:             false,
        }
      )
      if (isKick) notifyClients()
    }
  }

  if (changed) await swSet('pre-match-v1', fired)
}

// ── Background breaking-news check ───────────────────────────────────────────
async function backgroundNewsCheck() {
  let posts
  try {
    const res = await fetch('https://www.reddit.com/r/worldcup/hot.json?limit=12', {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return
    const json = await res.json()
    posts = json?.data?.children?.map(c => c.data) ?? []
  } catch { return }

  const now     = Date.now() / 1000
  const seenRaw = (await swGet('news-seen')) ?? []
  const seen    = new Set(seenRaw)
  let hasNew    = false
  let notified  = 0

  for (const post of posts) {
    if (notified >= 2) break
    if (seen.has(post.id)) continue
    if ((post.score ?? 0) < 5) continue
    if ((now - (post.created_utc ?? 0)) > 7200) continue // older than 2 h

    seen.add(post.id)
    hasNew   = true
    notified++

    try {
      await self.registration.showNotification('🚨 خبر عاجل — كأس العالم 2026', {
        body:               (post.title ?? '').slice(0, 120),
        icon:               ICON,
        badge:              ICON,
        dir:                'ltr',
        lang:               'en',
        tag:                `news-${post.id}`,
        renotify:           true,
        vibrate:            NEWS_VIB,
        requireInteraction: false,
        silent:             false,
      })
    } catch { /* notification permission denied */ }
  }

  if (hasNew) {
    await swSet('news-seen', [...seen].slice(-100))
    notifyNewsClients()
  }
}

// ── Periodic Background Sync (fires when app is closed on Android Chrome) ─────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'wc-live-check') {
    event.waitUntil(
      Promise.all([backgroundScoreCheck(), backgroundPreMatchCheck(), backgroundNewsCheck()])
    )
  }
})

// ── Message bus ───────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

  // App sends favorite team IDs so SW can check them in the background
  if (event.data?.type === 'SET_FAVORITES') {
    event.waitUntil(swSet('favs', event.data.favorites ?? []))
    return
  }

  // App detected new breaking news → show system notification on the phone screen
  if (event.data?.type === 'NEWS_ALERT') {
    const { text, id } = event.data
    const tag = `news-app-${(id ?? text ?? '').slice(0, 40).replace(/\s+/g, '_')}`
    event.waitUntil(
      self.registration.showNotification('🚨 خبر عاجل — كأس العالم 2026', {
        body:               (text ?? '').slice(0, 130),
        icon:               ICON,
        badge:              ICON,
        dir:                'rtl',
        lang:               'ar',
        tag,
        renotify:           true,
        vibrate:            NEWS_VIB,
        requireInteraction: false,
        silent:             false,
      }).catch(() => {})
    )
    return
  }

  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, vibrate, requireInteraction } = event.data
    const isWhistleType = (tag ?? '').includes('whistle') ||
                          (tag ?? '').includes('fav')    ||
                          (tag ?? '').includes('kick')   ||
                          (tag ?? '').includes('warning')
    const vib = vibrate ?? (isWhistleType ? WHISTLE_VIB : STANDARD_VIB)
    event.waitUntil(
      self.registration.showNotification(title, {
        body:                body ?? '',
        icon:                ICON,
        badge:               ICON,
        dir:                 'rtl',
        lang:                'ar',
        tag:                 tag ?? 'wc-alert',
        renotify:            true,
        vibrate:             vib,
        requireInteraction:  requireInteraction ?? isWhistleType,
        silent:              false,
        sound:               SOUND,
      }).then(() => isWhistleType ? notifyClients() : null)
    )
  }
})

// ── Server push (future backend) ─────────────────────────────────────────────
self.addEventListener('push', event => {
  const d = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(d.title ?? '🚨 كأس العالم 2026', {
      body:               d.body ?? '',
      icon:               ICON,
      badge:              ICON,
      dir:                'rtl',
      lang:               'ar',
      tag:                'wc-push',
      renotify:           true,
      vibrate:            WHISTLE_VIB,
      requireInteraction: d.requireInteraction ?? true,
      silent:             false,
      sound:              SOUND,
    }).then(() => notifyClients())
  )
})

// ── Notification tap → open/focus app ────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus()
      return clients.openWindow(BASE)
    })
  )
})
