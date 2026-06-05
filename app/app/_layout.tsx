import '../global.css';

import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';

// ─── PREVIEW MODE ────────────────────────────────────────────────────────────
// Set to true to skip Supabase auth entirely during local UI preview.
// Flip back to false before connecting a real Supabase project.
export const PREVIEW_MODE = true;
// ─────────────────────────────────────────────────────────────────────────────

// Enforce RTL globally on native platforms
if (Platform.OS !== 'web') {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

export default function RootLayout() {
  useEffect(() => {
    // In preview mode the auth listener is skipped; login.tsx handles navigation.
    if (PREVIEW_MODE) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace('/(auth)/login');
        } else {
          router.replace('/(app)/dashboard');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
