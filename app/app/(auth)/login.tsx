import {
  View, Text, TouchableOpacity, ActivityIndicator,
  Platform, Dimensions, ScrollView,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { PREVIEW_MODE } from '../_layout';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

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
      options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } },
    });
    if (error) setError('فشل تسجيل الدخول. حاول مرة أخرى.');
    setLoading(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#4338CA' }}>
      {/* Background decorative circles */}
      <View style={{
        position: 'absolute', top: -60, right: -60,
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(167,139,250,0.25)',
      }} />
      <View style={{
        position: 'absolute', top: 80, left: -40,
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: 'rgba(99,102,241,0.3)',
      }} />
      <View style={{
        position: 'absolute', top: 160, right: 30,
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(245,158,11,0.2)',
      }} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, justifyContent: 'space-between', minHeight: isWeb ? 600 : undefined }}>

          {/* ── Hero top section ── */}
          <View style={{
            alignItems: 'center',
            paddingTop: isWeb ? 80 : 100,
            paddingHorizontal: 32,
            paddingBottom: 40,
          }}>
            {/* Logo mark */}
            <View style={{
              width: 80, height: 80, borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
            }}>
              <Text style={{ fontSize: 38 }}>🚀</Text>
            </View>

            <Text style={{
              fontSize: isWeb ? 38 : 32, fontWeight: '900',
              color: '#FFFFFF', textAlign: 'center',
              letterSpacing: -0.5, marginBottom: 10,
            }}>
              منصة المحتوى
            </Text>
            <Text style={{
              fontSize: 16, color: 'rgba(199,210,254,0.9)',
              textAlign: 'center', lineHeight: 24, maxWidth: 280,
            }}>
              أدِر جميع حساباتك على وسائل التواصل من مكان واحد
            </Text>

            {/* Feature pills */}
            <View style={{
              flexDirection: 'row', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center',
            }}>
              {['📅 جدولة', '🤖 ذكاء اصطناعي', '📊 إحصائيات'].map(f => (
                <View key={f} style={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                }}>
                  <Text style={{ color: '#E0E7FF', fontSize: 12, fontWeight: '600' }}>{f}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Bottom card ── */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 36, borderTopRightRadius: 36,
            paddingHorizontal: isWeb ? 40 : 28,
            paddingTop: 36, paddingBottom: isWeb ? 48 : 50,
            ...(isWeb ? { maxWidth: 520, alignSelf: 'center', width: '100%', borderRadius: 28, marginBottom: 40 } : {}),
            shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24, elevation: 16,
          }}>
            <Text style={{
              fontSize: 22, fontWeight: '800', color: '#111827',
              textAlign: 'center', marginBottom: 6,
            }}>
              مرحباً بك 👋
            </Text>
            <Text style={{
              fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 28,
            }}>
              سجّل دخولك للبدء فوراً — مجاناً
            </Text>

            {PREVIEW_MODE && (
              <TouchableOpacity
                onPress={() => router.replace('/(app)/dashboard')}
                style={{
                  backgroundColor: '#4F46E5', borderRadius: 16,
                  paddingVertical: 16, alignItems: 'center', marginBottom: 12,
                }}
                activeOpacity={0.85}
              >
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>👁️ معاينة الواجهة</Text>
              </TouchableOpacity>
            )}

            {/* Google button */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.88}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#FFFFFF', borderRadius: 16,
                paddingVertical: 16, paddingHorizontal: 20,
                borderWidth: 1.5, borderColor: '#E5E7EB',
                shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
                marginBottom: 16,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#4F46E5" />
              ) : (
                <>
                  <Text style={{ fontSize: 22, marginLeft: 10 }}>G</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151' }}>
                    المتابعة بحساب Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {error && (
              <View style={{
                backgroundColor: '#FEF2F2', borderRadius: 12,
                padding: 12, marginBottom: 12,
                borderWidth: 1, borderColor: '#FECACA',
              }}>
                <Text style={{ color: '#DC2626', fontSize: 13, textAlign: 'center' }}>{error}</Text>
              </View>
            )}

            <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 }}>
              بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية{'\n'}
              لا حاجة لكلمة مرور — تسجيل بنقرة واحدة
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
