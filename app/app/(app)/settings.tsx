import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

const isWeb = Platform.OS === 'web';

interface UserProfile {
  name: string | null;
  email: string | null;
  avatar: string | null;
}

const SETTINGS_GROUPS = [
  {
    title: 'الحساب',
    items: [
      { icon: '🔗', label: 'المنصات المرتبطة', sub: 'إدارة حسابات التواصل الاجتماعي', route: '/(app)/accounts' },
      { icon: '💎', label: 'الاشتراك والفوترة', sub: 'إدارة خطتك وتجديد الاشتراك', route: '/(app)/subscription' },
    ],
  },
  {
    title: 'التطبيق',
    items: [
      { icon: '🔔', label: 'الإشعارات', sub: 'تحكّم في تنبيهات التطبيق', route: null },
      { icon: '🌐', label: 'اللغة والمنطقة', sub: 'العربية', route: null },
      { icon: '🎨', label: 'المظهر', sub: 'الوضع الفاتح', route: null },
    ],
  },
  {
    title: 'المساعدة والدعم',
    items: [
      { icon: '❓', label: 'مركز المساعدة', sub: 'الأسئلة الشائعة والأدلة', route: null },
      { icon: '💬', label: 'تواصل معنا', sub: 'نرد خلال 24 ساعة', route: null },
      { icon: '⭐', label: 'قيّم التطبيق', sub: 'شاركنا رأيك', route: null },
    ],
  },
];

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile>({ name: null, email: null, avatar: null });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata ?? {};
      setProfile({
        name: meta.full_name ?? meta.name ?? meta.display_name ?? null,
        email: user.email ?? null,
        avatar: meta.avatar_url ?? meta.picture ?? null,
      });
    });
  }, []);

  async function handleSignOut() {
    const doSignOut = () => supabase.auth.signOut();
    if (isWeb) {
      doSignOut();
    } else {
      Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', style: 'destructive', onPress: doSignOut },
      ]);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F8FF' }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          ...(isWeb ? { maxWidth: 700, alignSelf: 'center' as const, width: '100%' } : {}),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{
          backgroundColor: '#0C1040',
          paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36,
          borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
          marginBottom: -18, overflow: 'hidden',
        }}>
          <View style={{
            position: 'absolute', top: -30, left: -30, width: 130, height: 130,
            borderRadius: 65, backgroundColor: 'rgba(6,182,212,0.15)',
          }} />
          <View style={{
            position: 'absolute', bottom: -20, right: -20, width: 100, height: 100,
            borderRadius: 50, backgroundColor: 'rgba(147,51,234,0.2)',
          }} />
          <Text style={{ color: 'rgba(103,232,249,0.75)', fontSize: 13, textAlign: 'right' }}>تخصيص التجربة</Text>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900', textAlign: 'right' }}>الإعدادات</Text>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 30 }}>

          {/* ── Profile card ── */}
          <View style={{
            backgroundColor: '#FFF', borderRadius: 22, padding: 20,
            marginBottom: 24,
            shadowColor: '#0C1040', shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
            borderWidth: 1, borderColor: '#EEF9FF',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Sign out button */}
              <TouchableOpacity
                onPress={handleSignOut}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#FEF2F2', borderRadius: 12,
                  paddingHorizontal: 14, paddingVertical: 8,
                  borderWidth: 1, borderColor: '#FECACA',
                }}
              >
                <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '700' }}>خروج</Text>
              </TouchableOpacity>

              {/* Name & email */}
              <View style={{ flex: 1, alignItems: 'flex-end', marginHorizontal: 14 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>
                  {profile.name ?? 'المستخدم'}
                </Text>
                {profile.email && (
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{profile.email}</Text>
                )}
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  marginTop: 4, backgroundColor: '#EEF9FF',
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                }}>
                  <Text style={{ fontSize: 10, color: '#06B6D4', fontWeight: '700' }}>Google Account</Text>
                  <Text style={{ fontSize: 10 }}>G</Text>
                </View>
              </View>

              {/* Avatar */}
              {profile.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  style={{
                    width: 54, height: 54, borderRadius: 18,
                    borderWidth: 2, borderColor: '#EEF9FF',
                  }}
                />
              ) : (
                <View style={{
                  width: 54, height: 54, borderRadius: 18,
                  backgroundColor: '#EEF9FF', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 28 }}>👤</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Settings groups ── */}
          {SETTINGS_GROUPS.map(group => (
            <View key={group.title} style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 11, fontWeight: '700', color: '#9CA3AF',
                textAlign: 'right', marginBottom: 8, marginRight: 4,
                textTransform: 'uppercase', letterSpacing: 0.8,
              }}>
                {group.title}
              </Text>
              <View style={{
                backgroundColor: '#FFF', borderRadius: 20,
                shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
                borderWidth: 1, borderColor: '#F5F8FF', overflow: 'hidden',
              }}>
                {group.items.map((item, i) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => item.route && router.push(item.route as any)}
                    activeOpacity={item.route ? 0.7 : 1}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingVertical: 14, paddingHorizontal: 16,
                      borderBottomWidth: i < group.items.length - 1 ? 1 : 0,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    {item.route && <Text style={{ color: '#D1D5DB', fontSize: 18 }}>←</Text>}
                    <View style={{ flex: 1, alignItems: 'flex-end', marginRight: item.route ? 10 : 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>{item.label}</Text>
                      <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{item.sub}</Text>
                    </View>
                    <View style={{
                      width: 38, height: 38, borderRadius: 12,
                      backgroundColor: '#F5F8FF', alignItems: 'center', justifyContent: 'center', marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <Text style={{ textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 8 }}>
            منصة المحتوى — الإصدار 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
