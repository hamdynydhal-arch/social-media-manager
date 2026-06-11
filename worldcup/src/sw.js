import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Cache Google Fonts
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536000 })]
  })
)

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }
  // Show notification via SW (more reliable in background)
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

// Server-push notifications (future: when backend is added)
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

// Notification click — open/focus the app
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus()
      return clients.openWindow('/social-media-manager/world-cup/')
    })
  )
})
