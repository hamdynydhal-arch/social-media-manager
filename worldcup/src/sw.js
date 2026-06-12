// v18 — lock-screen: image banner + double vibrate + client audio trigger
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
          .filter(k => k.startsWith('workbox-') || k.startsWith('wc-'))
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

// Vibration: referee whistle (short-short-long) — works on Android lock screen
const WHISTLE_VIB  = [300, 100, 300, 100, 800]
const STANDARD_VIB = [200, 100, 200]

// Send PLAY_WHISTLE to every open client tab so audio fires immediately
function notifyClients() {
  return clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then(list => list.forEach(c => c.postMessage({ type: 'PLAY_WHISTLE' })))
}

// ── Message bus ──────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
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
      return clients.openWindow('/social-media-manager/world-cup/')
    })
  )
})
