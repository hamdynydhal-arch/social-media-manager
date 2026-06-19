import {
  View, Text, TouchableOpacity, ActivityIndicator,
  Platform, Dimensions, ScrollView, Image,
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
    <View style={{ flex: 1, backgroundColor: '#0C0820' }}>
      {/* Background glow orbs */}
      <View style={{
        position: 'absolute', top: -80, left: -80,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(6,182,212,0.12)',
      }} />
      <View style={{
        position: 'absolute', top: 100, right: -60,
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(168,85,247,0.14)',
      }} />
      <View style={{
        position: 'absolute', bottom: 180, left: -40,
        width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(236,72,153,0.1)',
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
            {/* Logo image */}
            <View style={{
              width: 124, height: 124, borderRadius: 38,
              backgroundColor: 'rgba(255,255,255,0.04)',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 22,
              borderWidth: 1.5, borderColor: 'rgba(6,182,212,0.45)',
              shadowColor: '#06B6D4', shadowOpacity: 0.55, shadowRadius: 30, elevation: 14,
            }}>
              <Image
                source={require('../../assets/logo.jpg')}
                style={{ width: 100, height: 100, borderRadius: 30 }}
                resizeMode="contain"
              />
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
              {[
                { label: '📅 جدولة', bg: 'rgba(6,182,212,0.18)', border: 'rgba(6,182,212,0.4)' },
                { label: '🤖 ذكاء اصطناعي', bg: 'rgba(168,85,247,0.18)', border: 'rgba(168,85,247,0.4)' },
                { label: '📊 إحصائيات', bg: 'rgba(251,191,36,0.14)', border: 'rgba(251,191,36,0.38)' },
              ].map(f => (
                <View key={f.label} style={{
                  backgroundColor: f.bg,
                  borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
                  borderWidth: 1, borderColor: f.border,
                }}>
                  <Text style={{ color: '#E0F2FE', fontSize: 12, fontWeight: '700' }}>{f.label}</Text>
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
            shadowColor: '#06B6D4', shadowOpacity: 0.15, shadowRadius: 32, elevation: 20,
          }}>
            {/* Cyan accent bar at top */}
            <View style={{
              position: 'absolute', top: 0, left: '25%', right: '25%', height: 3,
              backgroundColor: '#06B6D4', borderRadius: 2,
            }} />
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
                  backgroundColor: '#8B5CF6', borderRadius: 16,
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
                <ActivityIndicator color="#06B6D4" />
              ) : (
                <>
                  {/* Google colored logo letters */}
                  <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#4285F4' }}>G</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#EA4335' }}>o</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#FBBC05' }}>o</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#4285F4' }}>g</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#34A853' }}>l</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#EA4335' }}>e</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#374151', marginRight: 8 }}>
                    المتابعة بحساب
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
