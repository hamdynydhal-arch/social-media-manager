import '../global.css';

import { useEffect, useState } from 'react';
import { ActivityIndicator, I18nManager, Platform, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';

export const PREVIEW_MODE = false;

if (Platform.OS !== 'web') {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

// Returns true when the current web URL carries an OAuth callback hash/query.
// In that case we must NOT redirect to login — Supabase needs the hash intact.
function hasOAuthFragment(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const h = window.location.hash;
  const q = window.location.search;
  return (
    h.includes('access_token') ||
    h.includes('refresh_token') ||
    q.includes('code=') ||
    q.includes('access_token')
  );
}

export default function RootLayout() {
  // `ready` becomes true once we know the auth state and have navigated.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (PREVIEW_MODE) { setReady(true); return; }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION') {
          if (session) {
            // User already has a valid session
            router.replace('/(app)/dashboard');
          } else if (hasOAuthFragment()) {
            // OAuth hash is present — Supabase is still exchanging the token.
            // Stay on the loading screen; SIGNED_IN will fire momentarily.
            return;
          } else {
            // No session and no OAuth hash → go to login
            router.replace('/(auth)/login');
          }
          setReady(true);
          return;
        }

        if (event === 'SIGNED_IN') {
          router.replace('/(app)/dashboard');
          setReady(true);
        } else if (event === 'SIGNED_OUT') {
          router.replace('/(auth)/login');
          setReady(true);
        } else if (event === 'TOKEN_REFRESHED') {
          // Session silently refreshed — no navigation needed
          setReady(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Loading screen — shown while auth state is being resolved
  // (covers the OAuth redirect window so users never see a blank page)
  if (!ready) {
    return (
      <View style={{
        flex: 1, backgroundColor: '#0C0820',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <ActivityIndicator size="large" color="#06B6D4" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
