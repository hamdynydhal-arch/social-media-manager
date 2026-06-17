import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { PREVIEW_MODE } from '../_layout';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const redirectTo = Platform.OS === 'web'
      ? 'https://smm.prtnh.com'
      : 'social-media-manager://';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) setError('فشل تسجيل الدخول. حاول مرة أخرى.');
    setLoading(false);
  }

  function handleMockLogin() {
    router.replace('/(app)/dashboard');
  }

  return (
    <View className="flex-1 items-center justify-center bg-brand-50 px-8" style={{ direction: 'rtl' }}>
      {/* Logo */}
      <View className="mb-12 items-center">
        <Text className="text-4xl font-bold text-brand-900 text-center">منصة المحتوى</Text>
        <Text className="mt-3 text-base text-gray-500 text-center">
          أدِر حساباتك على وسائل التواصل الاجتماعي من مكان واحد
        </Text>
      </View>

      {/* Preview mode banner */}
      {PREVIEW_MODE && (
        <View className="w-full bg-amber-100 border border-amber-300 rounded-2xl px-4 py-3 mb-6">
          <Text className="text-amber-800 text-xs font-semibold text-center">
            🔧 وضع المعاينة — لا يتطلب Supabase
          </Text>
        </View>
      )}

      {/* Mock login button — shown only in preview mode */}
      {PREVIEW_MODE && (
        <TouchableOpacity
          onPress={handleMockLogin}
          className="flex-row items-center justify-center bg-indigo-600 rounded-2xl px-6 py-4 w-full mb-4 active:opacity-80"
        >
          <Text className="text-xl ml-3">👁️</Text>
          <Text className="text-base font-bold text-white">معاينة واجهة التطبيق</Text>
        </TouchableOpacity>
      )}

      {/* Divider — shown only when both buttons are visible */}
      {PREVIEW_MODE && (
        <View className="flex-row items-center w-full mb-4">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-3 text-xs text-gray-400">أو</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>
      )}

      {/* Real Google sign-in */}
      <TouchableOpacity
        onPress={handleGoogleLogin}
        disabled={loading}
        className="flex-row items-center justify-center bg-white rounded-2xl px-6 py-4 w-full border border-gray-200 shadow-sm active:opacity-80"
      >
        {loading ? (
          <ActivityIndicator color="#2563eb" />
        ) : (
          <>
            <Text className="text-2xl ml-3">🔵</Text>
            <Text className="text-base font-semibold text-gray-700">
              تسجيل الدخول بحساب Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      {error && (
        <Text className="mt-4 text-sm text-red-500 text-center">{error}</Text>
      )}

      <Text className="mt-8 text-xs text-gray-400 text-center">
        {PREVIEW_MODE
          ? 'لتفعيل المصادقة الحقيقية، غيّر PREVIEW_MODE إلى false في _layout.tsx'
          : 'تسجيل الدخول بـ Google فقط. لا حاجة لكلمة مرور.'}
      </Text>
    </View>
  );
}
