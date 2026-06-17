import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker — SW calls skipWaiting() on install so updates apply immediately.
registerSW({ onNeedRefresh() {}, onOfflineReady() {} })

// Capture beforeinstallprompt as early as possible — before React mounts.
// Stored on window so any component can call window.deferredPrompt.prompt() at any time.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredPrompt = e
})
window.addEventListener('appinstalled', () => {
  window.deferredPrompt = null
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
