import { useState, useEffect } from 'react'

export function useInstallPrompt() {
  // Initialise from window.deferredPrompt in case the event fired before React mounted
  const [installPrompt, setInstallPrompt] = useState(() => window.deferredPrompt ?? null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent))

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsInstalled(standalone)

    // Fired BEFORE React mounted → captured by the inline <script> in index.html
    const onPromptReady = () => {
      if (window.deferredPrompt) setInstallPrompt(window.deferredPrompt)
    }
    // Fired AFTER React mounted
    const onBeforeInstall = (e) => {
      e.preventDefault()
      window.deferredPrompt = e
      setInstallPrompt(e)
    }
    const onInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      window.deferredPrompt = null
    }

    document.addEventListener('pwa-prompt-ready', onPromptReady)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      document.removeEventListener('pwa-prompt-ready', onPromptReady)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const triggerInstall = async () => {
    // Prefer React state, fall back to window global
    const prompt = installPrompt ?? window.deferredPrompt
    if (!prompt) return false
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      window.deferredPrompt = null
      setInstallPrompt(null)
      setIsInstalled(true)
    }
    return outcome === 'accepted'
  }

  return {
    // Always reflect the freshest value
    installPrompt: installPrompt ?? window.deferredPrompt ?? null,
    isInstalled,
    isIOS,
    triggerInstall,
  }
}
