import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'social-media-manager://(app)/dashboard',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) setError('فشل تسجيل الدخول. حاول مرة أخرى.');
    setLoading(false);
  }

  return (
    <View className="flex-1 items-center justify-center bg-brand-50 px-8" style={{ direction: 'rtl' }}>
      {/* Logo / App Name */}
      <View className="mb-12 items-center">
        <Text className="text-4xl font-bold text-brand-900 text-center">
          منصة المحتوى
        </Text>
        <Text className="mt-3 text-base text-gray-500 text-center">
          أدِر حساباتك على وسائل التواصل الاجتماعي من مكان واحد
        </Text>
      </View>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        onPress={handleGoogleLogin}
        disabled={loading}
        className="flex-row items-center justify-center bg-white rounded-2xl px-6 py-4 w-full shadow-md border border-gray-200 active:opacity-80"
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
        تسجيل الدخول بـ Google فقط. لا حاجة لكلمة مرور.
      </Text>
    </View>
  );
}
