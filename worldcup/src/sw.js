// v17 — referee whistle vibration [300,100,300,100,800] + sound property + WAV file
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ── Immediately activate new SW without waiting for old tabs to close ────────
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

// ── Message bus ──────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, vibrate, requireInteraction } = event.data
    // Decide vibration: whistle/fav tags get the referee pattern
    const isWhistleType = (tag ?? '').includes('whistle') ||
                          (tag ?? '').includes('fav')    ||
                          (tag ?? '').includes('kick')   ||
                          (tag ?? '').includes('warning')
    const vib = vibrate ?? (isWhistleType ? [300, 100, 300, 100, 800] : [200])
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body ?? '',
        icon: '/social-media-manager/world-cup/icons/icon-192.png',
        badge: '/social-media-manager/world-cup/icons/icon-192.png',
        dir: 'rtl',
        lang: 'ar',
        tag: tag ?? 'wc-alert',
        renotify: true,
        vibrate: vib,
        requireInteraction: requireInteraction ?? false,
        silent: false,
        // sound is part of the Notifications spec (most browsers ignore on Android,
        // but we include it as the standard field)
        sound: '/social-media-manager/world-cup/sounds/whistle.wav',
      })
    )
  }
})

// ── Server push (future backend) ─────────────────────────────────────────────
self.addEventListener('push', event => {
  const d = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(d.title ?? '⚽ كأس العالم 2026', {
      body: d.body ?? '',
      icon: '/social-media-manager/world-cup/icons/icon-192.png',
      badge: '/social-media-manager/world-cup/icons/icon-192.png',
      dir: 'rtl',
      lang: 'ar',
      tag: 'wc-push',
      vibrate: [300, 100, 300, 100, 800],
      requireInteraction: d.requireInteraction ?? true,
      silent: false,
      sound: '/social-media-manager/world-cup/sounds/whistle.wav',
    })
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
