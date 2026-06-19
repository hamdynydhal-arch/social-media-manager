/**
 * PWAInstallPrompt — web-only component.
 * Renders nothing on native (Platform.OS !== 'web').
 *
 * Android/Chrome : listens for `beforeinstallprompt`, shows an install button.
 * iOS Safari     : detects via UA and shows share-sheet instructions.
 * Dismissed state is persisted in localStorage so the banner
 * doesn't re-appear after the user has explicitly closed it.
 */
import { useEffect, useRef, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, Image } from 'react-native';
import { Colors, Radii, Shadows } from '../constants/theme';

// Guard: nothing runs or renders on native
if (Platform.OS !== 'web') {
  // eslint-disable-next-line import/no-anonymous-default-export
  const Noop = () => null;
  // @ts-ignore
  export default Noop;
  // Stop the module from running further on native
}

const STORAGE_KEY = 'pwa_prompt_dismissed';
const DISMISSED_FOREVER = 'forever';

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  // Safari on iOS (not Chrome/Firefox wrapper)
  const isSafari = /safari/i.test(ua) && !/crios|fxios|chrome/i.test(ua);
  return isIos && isSafari;
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-ignore — iOS specific
    (window.navigator as any).standalone === true
  );
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === DISMISSED_FOREVER;
  } catch {
    return false;
  }
}

function persistDismiss(): void {
  try {
    localStorage.setItem(STORAGE_KEY, DISMISSED_FOREVER);
  } catch {}
}

export default function PWAInstallPrompt() {
  // Only render on web
  if (Platform.OS !== 'web') return null;

  const [show, setShow]           = useState(false);
  const [isIos, setIsIos]         = useState(false);
  const deferredRef               = useRef<any>(null);

  useEffect(() => {
    // Already installed or user already dismissed → do nothing
    if (isInStandaloneMode() || wasDismissed()) return;

    if (isIosSafari()) {
      setIsIos(true);
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(t);
    }

    // Android / Chrome / Edge — wait for browser prompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e;
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredRef.current) return;
    deferredRef.current.prompt();
    const { outcome } = await deferredRef.current.userChoice;
    if (outcome === 'accepted') {
      dismiss();
    }
    deferredRef.current = null;
  };

  const dismiss = () => {
    setShow(false);
    persistDismiss();
  };

  if (!show) return null;

  return (
    <View style={{
      position: 'absolute' as const,
      bottom: 90,          // sit just above the tab bar
      left: 12,
      right: 12,
      zIndex: 9999,
      // Cyan glow card
      backgroundColor: Colors.dark.header,
      borderRadius: Radii.card,
      borderWidth: 1.5,
      borderColor: Colors.cyan.glowStrong,
      padding: 16,
      ...Shadows.cyan,
    }}>
      {/* Glow orbs for premium feel */}
      <View style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: 40, backgroundColor: Colors.cyan.glow,
      }} />
      <View style={{
        position: 'absolute', bottom: -15, left: -15, width: 60, height: 60,
        borderRadius: 30, backgroundColor: Colors.purple.glow,
      }} />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* App logo */}
        <Image
          source={require('../../assets/logo.jpg')}
          style={{ width: 48, height: 48, borderRadius: 14, marginLeft: 12 }}
          resizeMode="contain"
        />

        {/* Text block */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{
            color: Colors.text.onDark, fontSize: 14, fontWeight: '800',
            textAlign: 'right', marginBottom: 2,
          }}>
            ثبّت التطبيق على جهازك
          </Text>

          {isIos ? (
            <Text style={{
              color: Colors.cyan.lighter, fontSize: 11, textAlign: 'right', lineHeight: 18,
            }}>
              اضغط على أيقونة المشاركة{' '}
              <Text style={{ fontSize: 13 }}>⬆️</Text>
              {' '}ثم اختر{'\n'}«إضافة للشاشة الرئيسية»
            </Text>
          ) : (
            <Text style={{
              color: Colors.cyan.lighter, fontSize: 11, textAlign: 'right',
            }}>
              استمتع بتجربة تطبيق أصلي بدون متصفح
            </Text>
          )}
        </View>

        {/* Close */}
        <TouchableOpacity
          onPress={dismiss}
          style={{
            position: 'absolute', top: -4, left: -4,
            width: 24, height: 24, borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: Colors.text.faint, fontSize: 12 }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Install button (Android/Chrome only) */}
      {!isIos && (
        <TouchableOpacity
          onPress={handleInstall}
          activeOpacity={0.85}
          style={{
            marginTop: 14,
            backgroundColor: Colors.cyan.DEFAULT,
            borderRadius: Radii.md,
            paddingVertical: 11,
            alignItems: 'center',
            ...Shadows.cyan,
          }}
        >
          <Text style={{ color: Colors.text.onDark, fontWeight: '800', fontSize: 14 }}>
            📲 تثبيت التطبيق
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
