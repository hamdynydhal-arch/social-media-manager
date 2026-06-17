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
const BASE       = self.registration.scope  // always ends with '/'
const ICON       = 'data:image/png;base64,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'
const BADGE_ICON = BASE + 'icons/badge-96.png'
const SOUND      = BASE + 'sounds/whistle.wav'

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
            icon: ICON, badge: BADGE_ICON, dir: 'rtl', lang: 'ar',
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
            icon: ICON, badge: BADGE_ICON, dir: 'rtl', lang: 'ar',
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
          badge:              BADGE_ICON,
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
        badge:              BADGE_ICON,
        dir:                'ltr',
        lang:               'en',
        tag:                `news-${post.id}`,
        renotify:           true,
        vibrate:            NEWS_VIB,
        requireInteraction: true,
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

  // Dev/QA: trigger background news check immediately + fire a sample notification
  if (event.data?.type === 'TEST_BREAKING_NEWS') {
    event.waitUntil((async () => {
      // 1. Immediate sample notification — visible even when Chrome is backgrounded
      try {
        await self.registration.showNotification('🚨 اختبار — خبر عاجل', {
          body:               'هذا إشعار تجريبي — الأخبار العاجلة تعمل في الخلفية ✅',
          icon:               ICON,
          badge:              BADGE_ICON,
          dir:                'rtl',
          lang:               'ar',
          tag:                'test-news-' + Date.now(),
          renotify:           true,
          vibrate:            NEWS_VIB,
          requireInteraction: true,
          silent:             false,
        })
      } catch {}
      // 2. Also run the real background news check right now
      await backgroundNewsCheck()
    })())
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
        badge:              BADGE_ICON,
        dir:                'rtl',
        lang:               'ar',
        tag,
        renotify:           true,
        vibrate:            NEWS_VIB,
        requireInteraction: true,
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
        badge:               BADGE_ICON,
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
      badge:              BADGE_ICON,
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
