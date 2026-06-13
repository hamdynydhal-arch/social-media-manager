// v20 — APK auto-update check via Periodic Background Sync
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

const ICON  = '/social-media-manager/world-cup/icons/icon-192.png'
const SOUND = '/social-media-manager/world-cup/sounds/whistle.wav'

const WHISTLE_VIB  = [300, 100, 300, 100, 800]
const STANDARD_VIB = [200, 100, 200]

// Live scores source (CORS * — GitHub CDN)
const OFB_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

// APK version manifest (same origin — always fresh)
const VERSION_URL = '/social-media-manager/world-cup/version.json'

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

// ── Broadcast PLAY_WHISTLE to all open tabs ───────────────────────────────────
function notifyClients() {
  return clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then(list => list.forEach(c => c.postMessage({ type: 'PLAY_WHISTLE' })))
}

// ── APK auto-update check ─────────────────────────────────────────────────────
async function checkApkUpdate() {
  let manifest
  try {
    const res = await fetch(VERSION_URL, { cache: 'no-store' })
    if (!res.ok) return
    manifest = await res.json()
  } catch { return }

  const { apkVersion, apkUrl, releaseNotes } = manifest ?? {}
  if (!apkVersion || !apkUrl) return

  const stored = await swGet('apk-version')

  // First run — seed silently (don't notify for the version already installed)
  if (!stored) {
    await swSet('apk-version', apkVersion)
    return
  }

  if (stored === apkVersion) return // no change

  // New version detected
  await swSet('apk-version', apkVersion)
  await self.registration.showNotification(
    `🆕 تحديث جديد — كأس العالم 2026 (${apkVersion})`,
    {
      body:               releaseNotes ?? 'اضغط لتنزيل النسخة الجديدة',
      icon:               ICON,
      badge:              ICON,
      dir:                'rtl',
      lang:               'ar',
      tag:                `apk-update-${apkVersion}`,
      renotify:           true,
      requireInteraction: true,
      silent:             false,
      vibrate:            STANDARD_VIB,
      data:               { url: apkUrl },
      actions:            [{ action: 'download', title: '⬇️ تحميل التحديث' }],
    }
  )
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

// ── Periodic Background Sync (fires when app is closed on Android Chrome) ─────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'wc-live-check') {
    event.waitUntil(
      Promise.all([backgroundScoreCheck(), checkApkUpdate()])
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

// ── Notification tap → open/focus app (or download APK) ──────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const apkUrl = event.notification.data?.url

  // "Download update" action button OR tap on an APK-update notification
  if (event.action === 'download' || (apkUrl && event.action === '')) {
    event.waitUntil(clients.openWindow(apkUrl))
    return
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus()
      return clients.openWindow('/social-media-manager/world-cup/')
    })
  )
})
