import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';

interface PWAContextValue {
  isInstallable: boolean;
  triggerInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextValue>({
  isInstallable: false,
  triggerInstall: async () => {},
});

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Pick up event pre-captured by the inline script before React mounted
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function triggerInstall() {
    if (!deferredPrompt) {
      Alert.alert(
        'التثبيت',
        'التطبيق مثبت بالفعل أو المتصفح لا يدعم التثبيت المباشر',
        [{ text: 'حسناً' }]
      );
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    }
  }

  return (
    <PWAContext.Provider value={{ isInstallable: deferredPrompt !== null, triggerInstall }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAContext(): PWAContextValue {
  return useContext(PWAContext);
}
