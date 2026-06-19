import { View, Text, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';

const isWeb = Platform.OS === 'web';

interface UserProfile {
  name: string | null;
  firstName: string | null;
  email: string | null;
  avatar: string | null;
}

const STATS = [
  { label: 'منصات مرتبطة', value: '—', icon: '🔗', color: '#4F46E5', bg: '#EEF2FF' },
  { label: 'منشورات الشهر', value: '—', icon: '📝', color: '#059669', bg: '#ECFDF5' },
  { label: 'تفاعلات', value: '—', icon: '💬', color: '#D97706', bg: '#FFFBEB' },
];

const QUICK_ACTIONS = [
  { label: 'إنشاء منشور جديد', sub: 'انشر على جميع منصاتك دفعة واحدة', icon: '✏️', color: '#4F46E5', route: '/(app)/new-post' },
  { label: 'ربط حساب جديد', sub: 'اربط X، LinkedIn، Facebook وغيرها', icon: '🔗', color: '#7C3AED', route: '/(app)/accounts' },
];

const CHECKLIST = [
  { label: 'ربط أول منصة', route: '/(app)/accounts' },
  { label: 'إنشاء أول منشور', route: '/(app)/new-post' },
  { label: 'اختيار خطة اشتراك', route: '/(app)/subscription' },
];

export default function DashboardScreen() {
  const [profile, setProfile] = useState<UserProfile>({ name: null, firstName: null, email: null, avatar: null });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata ?? {};
      const fullName: string = meta.full_name ?? meta.name ?? meta.display_name ?? '';
      const firstName = fullName.split(' ')[0] ?? null;
      setProfile({
        name: fullName || null,
        firstName: firstName || null,
        email: user.email ?? null,
        avatar: meta.avatar_url ?? meta.picture ?? null,
      });
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FF' }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 36,
          ...(isWeb ? { maxWidth: 700, alignSelf: 'center' as const, width: '100%' } : {}),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header gradient ── */}
        <View style={{
          backgroundColor: '#4338CA',
          paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36,
          borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
          marginBottom: -18, overflow: 'hidden',
        }}>
          <View style={{
            position: 'absolute', top: -30, left: -30, width: 130, height: 130,
            borderRadius: 65, backgroundColor: 'rgba(129,140,248,0.18)',
          }} />
          <View style={{
            position: 'absolute', bottom: 0, right: -20, width: 90, height: 90,
            borderRadius: 45, backgroundColor: 'rgba(245,158,11,0.12)',
          }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Avatar */}
            {profile.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={{ width: 46, height: 46, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' }}
              />
            ) : (
              <View style={{
                width: 46, height: 46, borderRadius: 15,
                backgroundColor: 'rgba(255,255,255,0.14)',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
              }}>
                <Text style={{ fontSize: 24 }}>🚀</Text>
              </View>
            )}

            {/* Greeting */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: 'rgba(199,210,254,0.75)', fontSize: 13 }}>
                {profile.firstName ? `أهلاً، ${profile.firstName} 👋` : 'أهلاً بك 👋'}
              </Text>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900' }}>لوحة التحكم</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 30 }}>

          {/* ── Stats ── */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 26 }}>
            {STATS.map(s => (
              <View key={s.label} style={{
                flex: 1, backgroundColor: '#FFF', borderRadius: 20,
                paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center',
                shadowColor: '#4338CA', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
                borderWidth: 1, borderColor: '#EEF2FF',
              }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 13,
                  backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                }}>
                  <Text style={{ fontSize: 19 }}>{s.icon}</Text>
                </View>
                <Text style={{ fontSize: 22, fontWeight: '900', color: s.color }}>{s.value}</Text>
                <Text style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 3, lineHeight: 14 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Quick actions ── */}
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B', textAlign: 'right', marginBottom: 12 }}>
            إجراءات سريعة
          </Text>
          <View style={{ gap: 12, marginBottom: 28 }}>
            {QUICK_ACTIONS.map(a => (
              <TouchableOpacity
                key={a.label}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.87}
                style={{
                  backgroundColor: a.color, borderRadius: 22, padding: 18,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  shadowColor: a.color, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
                }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>←</Text>
                <View style={{ flex: 1, alignItems: 'flex-end', marginHorizontal: 12 }}>
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>{a.label}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 3 }}>{a.sub}</Text>
                </View>
                <View style={{
                  width: 50, height: 50, borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 26 }}>{a.icon}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Getting started ── */}
          <View style={{
            backgroundColor: '#FFF', borderRadius: 22, padding: 20,
            shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
            borderWidth: 1, borderColor: '#EEF2FF', marginBottom: 20,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B', textAlign: 'right', marginBottom: 14 }}>
              🎯 خطواتك الأولى
            </Text>
            {CHECKLIST.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 13,
                  borderBottomWidth: i < CHECKLIST.length - 1 ? 1 : 0,
                  borderBottomColor: '#F3F4F6',
                }}
              >
                <Text style={{ color: '#9CA3AF', fontSize: 18 }}>←</Text>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'right', marginHorizontal: 12 }}>
                  {item.label}
                </Text>
                <View style={{
                  width: 26, height: 26, borderRadius: 9,
                  backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: '#E5E7EB',
                }} />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Upgrade banner ── */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/subscription')}
            activeOpacity={0.9}
            style={{
              backgroundColor: '#1E1B4B', borderRadius: 22, padding: 20,
              flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
              shadowColor: '#1E1B4B', shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
            }}
          >
            <View style={{
              position: 'absolute', top: -25, left: -25, width: 90, height: 90,
              borderRadius: 45, backgroundColor: 'rgba(139,92,246,0.25)',
            }} />
            <Text style={{ fontSize: 36, marginLeft: 16 }}>💎</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '800' }}>اشترك بالخطة السنوية</Text>
              <Text style={{ color: '#A5B4FC', fontSize: 12, marginTop: 4 }}>وفّر 50% — 6 أشهر مجاناً!</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
