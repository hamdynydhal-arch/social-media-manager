import { useEffect, useState } from 'react';

const SNOOZE_KEY = 'pwa_install_dismissed_at';
const SNOOZE_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const snoozedAt = localStorage.getItem(SNOOZE_KEY);
    if (snoozedAt) {
      const elapsed = Date.now() - Number(snoozedAt);
      if (elapsed < SNOOZE_DAYS * 24 * 60 * 60 * 1000) return;
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    localStorage.setItem(SNOOZE_KEY, String(Date.now()));
    setShowBanner(false);
    setDeferredPrompt(null);
  }

  return { showBanner, handleInstall, handleDismiss };
}
