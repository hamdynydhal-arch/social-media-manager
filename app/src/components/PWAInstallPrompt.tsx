/**
 * PWAInstallPrompt — web-only floating banner.
 * Returns null immediately on native (Platform.OS !== 'web').
 *
 * Android/Chrome : listens for `beforeinstallprompt`, shows install button.
 * iOS Safari     : detects via UA, shows share-sheet instructions in Arabic.
 * Dismissed state persisted in localStorage — won't re-appear after close.
 */
import { useEffect, useRef, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, Image } from 'react-native';
import { Colors, Radii, Shadows } from '../constants/theme';

const STORAGE_KEY = 'pwa_prompt_dismissed';

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios|chrome/i.test(ua);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function wasDismissed(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
}

function persistDismiss(): void {
  try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
}

export default function PWAInstallPrompt() {
  // Hard guard — nothing executes on native
  if (Platform.OS !== 'web') return null;

  const [show, setShow]     = useState(false);
  const [isIos, setIsIos]   = useState(false);
  const deferredRef         = useRef<any>(null);

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return;

    if (isIosSafari()) {
      setIsIos(true);
      const t = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(t);
    }

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
    deferredRef.current = null;
    if (outcome === 'accepted') dismiss();
  };

  const dismiss = () => { setShow(false); persistDismiss(); };

  if (!show) return null;

  return (
    <View style={{
      position: 'absolute',
      bottom: 90,
      left: 12,
      right: 12,
      zIndex: 9999,
      backgroundColor: Colors.dark.header,
      borderRadius: Radii.card,
      borderWidth: 1.5,
      borderColor: Colors.cyan.glowStrong,
      padding: 16,
      overflow: 'hidden',
      ...Shadows.cyan,
    }}>
      {/* Glow orbs */}
      <View style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.cyan.glow }} />
      <View style={{ position: 'absolute', bottom: -15, left: -15, width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.purple.glow }} />

      {/* Close button */}
      <TouchableOpacity
        onPress={dismiss}
        style={{
          position: 'absolute', top: 8, left: 8, zIndex: 1,
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.1)',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Text style={{ color: Colors.text.faint, fontSize: 12 }}>✕</Text>
      </TouchableOpacity>

      {/* Content row */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={require('../../assets/logo.jpg')}
          style={{ width: 48, height: 48, borderRadius: 14, marginLeft: 12 }}
          resizeMode="contain"
        />
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{ color: Colors.text.onDark, fontSize: 14, fontWeight: '800', textAlign: 'right', marginBottom: 3 }}>
            ثبّت التطبيق على جهازك
          </Text>
          {isIos ? (
            <Text style={{ color: Colors.cyan.lighter, fontSize: 11, textAlign: 'right', lineHeight: 18 }}>
              اضغط على أيقونة المشاركة ⬆️ ثم اختر{'\n'}«إضافة للشاشة الرئيسية»
            </Text>
          ) : (
            <Text style={{ color: Colors.cyan.lighter, fontSize: 11, textAlign: 'right' }}>
              استمتع بتجربة تطبيق أصلي بدون متصفح
            </Text>
          )}
        </View>
      </View>

      {/* Install button — Android/Chrome only */}
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
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>
            📲 تثبيت التطبيق
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
