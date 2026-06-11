// v9 — dynamic standings, red cards, android install modal, aggressive CORS fallback
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
  // Legacy compat: vite-plugin-pwa autoUpdate sends this
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, vibrate } = event.data
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body ?? '',
        icon: '/social-media-manager/world-cup/icons/icon-192.png',
        badge: '/social-media-manager/world-cup/icons/icon-192.png',
        dir: 'rtl',
        lang: 'ar',
        tag: tag ?? 'wc-alert',
        renotify: true,
        vibrate: vibrate ?? [200],
      })
    )
  }
})

// ── Server push (future backend) ─────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? '⚽ كأس العالم 2026', {
      body: data.body ?? '',
      icon: '/social-media-manager/world-cup/icons/icon-192.png',
      badge: '/social-media-manager/world-cup/icons/icon-192.png',
      dir: 'rtl',
      lang: 'ar',
      tag: 'wc-push',
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
