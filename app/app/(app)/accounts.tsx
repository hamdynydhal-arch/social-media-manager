import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, supabaseUrl } from '../../src/lib/supabase';
import { PLATFORM_META, Platform as SocialPlatform } from '../../src/constants/platforms';

WebBrowser.maybeCompleteAuthSession();

const isWeb = Platform.OS === 'web';

const DISPLAY_PLATFORMS: SocialPlatform[] = [
  'x', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok', 'threads',
];
const COMING_SOON: SocialPlatform[] = ['instagram', 'tiktok', 'threads'];

interface ConnectedAccount {
  id: string;
  platform: SocialPlatform;
  platform_username: string | null;
  platform_user_id: string | null;
  created_at: string;
  is_active: boolean;
}

const PLATFORM_ICON: Record<SocialPlatform, string> = {
  x: '𝕏', instagram: '📸', facebook: 'f',
  tiktok: '🎵', youtube: '▶', linkedin: 'in', threads: '@',
};

const PLATFORM_COLOR: Record<SocialPlatform, string> = {
  x: '#000000', instagram: '#E1306C', facebook: '#1877F2',
  tiktok: '#010101', youtube: '#FF0000', linkedin: '#0077B5', threads: '#000000',
};

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState<SocialPlatform | null>(null);

  const loadAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('id, platform, platform_username, platform_user_id, created_at, is_active')
      .order('created_at', { ascending: true });
    if (error) Alert.alert('خطأ', `فشل تحميل الحسابات: ${error.message}`);
    else setAccounts((data ?? []) as ConnectedAccount[]);
  }, []);

  useEffect(() => { loadAccounts().finally(() => setLoading(false)); }, [loadAccounts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  }, [loadAccounts]);

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      const parsed = Linking.parse(url);
      if (parsed.path === 'oauth' || parsed.hostname === 'oauth') {
        const platform = parsed.queryParams?.platform as string | undefined;
        const error = parsed.queryParams?.error as string | undefined;
        if (error) Alert.alert('فشل الربط', decodeURIComponent(error));
        else if (platform) {
          Alert.alert('تم الربط ✓', `تم ربط حساب ${PLATFORM_META[platform as SocialPlatform]?.labelAr ?? platform} بنجاح!`);
          loadAccounts();
        }
        setConnecting(null);
      }
    });
    return () => sub.remove();
  }, [loadAccounts]);

  const handleConnect = useCallback(async (platform: SocialPlatform) => {
    setConnecting(platform);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مسجّل الدخول');
      const redirectApp = Linking.createURL('oauth');
      const oauthInitUrl = [
        `${supabaseUrl}/functions/v1/oauth-callback`,
        `?platform=${encodeURIComponent(platform)}`,
        `&user_id=${encodeURIComponent(user.id)}`,
        `&redirect_app=${encodeURIComponent(redirectApp)}`,
      ].join('');
      const result = await WebBrowser.openAuthSessionAsync(oauthInitUrl, redirectApp);
      if (result.type !== 'success') setConnecting(null);
    } catch (err: unknown) {
      Alert.alert('خطأ', err instanceof Error ? err.message : String(err));
      setConnecting(null);
    }
  }, []);

  const handleDisconnect = useCallback((account: ConnectedAccount) => {
    const label = PLATFORM_META[account.platform].labelAr;
    Alert.alert(
      'فصل الحساب',
      `هل تريد فصل حساب ${label}${account.platform_username ? ` (@${account.platform_username})` : ''}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'فصل', style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('social_accounts').delete().eq('id', account.id);
            if (error) Alert.alert('خطأ', error.message);
            else setAccounts(prev => prev.filter(a => a.id !== account.id));
          },
        },
      ],
    );
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FF', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ color: '#6B7280', marginTop: 12, fontSize: 14 }}>جارٍ التحميل...</Text>
      </SafeAreaView>
    );
  }

  const connectedCount = accounts.length;
  const totalSupported = DISPLAY_PLATFORMS.length - COMING_SOON.length;
  const connectedMap = new Map(accounts.map(a => [a.platform, a]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FF' }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          ...(isWeb ? { maxWidth: 700, alignSelf: 'center' as const, width: '100%' } : {}),
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{
          backgroundColor: '#4338CA',
          paddingHorizontal: 20, paddingTop: 22, paddingBottom: 42,
          borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
          marginBottom: -20, overflow: 'hidden',
        }}>
          <View style={{
            position: 'absolute', bottom: -30, left: -30, width: 120, height: 120,
            borderRadius: 60, backgroundColor: 'rgba(129,140,248,0.18)',
          }} />
          <Text style={{ color: 'rgba(199,210,254,0.7)', fontSize: 13, textAlign: 'right' }}>إدارة المنصات</Text>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900', textAlign: 'right' }}>الحسابات المرتبطة</Text>

          {/* Progress */}
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
              <Text style={{ color: '#A5B4FC', fontSize: 12 }}>
                {Math.round((connectedCount / totalSupported) * 100)}% مكتمل
              </Text>
              <Text style={{ color: '#A5B4FC', fontSize: 12 }}>
                {connectedCount} / {totalSupported} منصات مرتبطة
              </Text>
            </View>
            <View style={{ height: 7, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 4 }}>
              <View style={{
                height: 7, borderRadius: 4,
                backgroundColor: connectedCount > 0 ? '#F59E0B' : 'transparent',
                width: `${(connectedCount / totalSupported) * 100}%` as any,
              }} />
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 30, gap: 12 }}>
          {DISPLAY_PLATFORMS.map(platform => {
            const meta = PLATFORM_META[platform];
            const account = connectedMap.get(platform);
            const isConnected = !!account;
            const isComingSoon = COMING_SOON.includes(platform);
            const isLoading = connecting === platform;
            const brandColor = PLATFORM_COLOR[platform];

            return (
              <View key={platform} style={{
                backgroundColor: '#FFF', borderRadius: 22,
                shadowColor: isConnected ? brandColor : '#4338CA',
                shadowOpacity: isConnected ? 0.18 : 0.05,
                shadowRadius: 14, elevation: isConnected ? 6 : 2,
                borderWidth: 1.5,
                borderColor: isConnected ? `${brandColor}40` : '#EEF2FF',
                opacity: isComingSoon ? 0.6 : 1,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                  {/* Platform icon */}
                  <View style={{
                    width: 50, height: 50, borderRadius: 16,
                    backgroundColor: brandColor, alignItems: 'center', justifyContent: 'center',
                    marginLeft: 14, flexShrink: 0,
                    shadowColor: brandColor, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
                  }}>
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 17 }}>
                      {PLATFORM_ICON[platform]}
                    </Text>
                  </View>

                  {/* Name & status */}
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827' }}>{meta.labelAr}</Text>
                      {isConnected && (
                        <View style={{ backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 10, color: '#059669', fontWeight: '700' }}>مرتبط ✓</Text>
                        </View>
                      )}
                      {isComingSoon && (
                        <View style={{ backgroundColor: '#FEF9C3', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 10, color: '#B45309', fontWeight: '700' }}>قريباً</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>
                      {isConnected && account?.platform_username
                        ? `@${account.platform_username}`
                        : isComingSoon ? 'سيتوفر قريباً' : 'غير مرتبط'}
                    </Text>
                  </View>

                  {/* Action button */}
                  {!isComingSoon && (
                    isConnected ? (
                      <TouchableOpacity
                        onPress={() => account && handleDisconnect(account)}
                        activeOpacity={0.8}
                        style={{
                          borderWidth: 1.5, borderColor: '#FECACA', borderRadius: 12,
                          paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#FFF5F5',
                        }}
                      >
                        <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '700' }}>فصل</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleConnect(platform)}
                        disabled={connecting !== null}
                        activeOpacity={0.85}
                        style={{
                          backgroundColor: connecting ? '#E0E7FF' : brandColor,
                          borderRadius: 13, paddingHorizontal: 16, paddingVertical: 9,
                          minWidth: 72, alignItems: 'center',
                          shadowColor: brandColor, shadowOpacity: connecting ? 0 : 0.35,
                          shadowRadius: 8, elevation: connecting ? 0 : 4,
                        }}
                      >
                        {isLoading
                          ? <ActivityIndicator size="small" color="#FFF" />
                          : <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>ربط</Text>
                        }
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            );
          })}

          {/* Security note */}
          <View style={{
            marginTop: 8, backgroundColor: '#EEF2FF', borderRadius: 20,
            padding: 18, borderWidth: 1, borderColor: '#C7D2FE',
          }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#3730A3', textAlign: 'right', marginBottom: 6 }}>
              🔒 حماية بياناتك
            </Text>
            <Text style={{ fontSize: 12, color: '#4338CA', textAlign: 'right', lineHeight: 20 }}>
              رموز الوصول مشفّرة بـ AES-256 داخل Supabase Vault. لا يمكن لأحد — بما فيه فريق التطوير — الاطلاع عليها.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
