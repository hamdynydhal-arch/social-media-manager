import '../global.css';

import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';
import PWAInstallPrompt from '../src/components/PWAInstallPrompt';

// ─── PREVIEW MODE ────────────────────────────────────────────────────────────
export const PREVIEW_MODE = false;
// ─────────────────────────────────────────────────────────────────────────────

if (Platform.OS !== 'web') {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

export default function RootLayout() {
  useEffect(() => {
    if (PREVIEW_MODE) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace('/(auth)/login');
        else router.replace('/(app)/dashboard');
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
      {/* PWA install prompt — web-only, renders null on native */}
      <PWAInstallPrompt />
    </SafeAreaProvider>
  );
}
