import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase, supabaseUrl } from '../../src/lib/supabase';
import { PLATFORM_META, Platform } from '../../src/constants/platforms';

WebBrowser.maybeCompleteAuthSession();

// ─── Ordered display list ─────────────────────────────────────────────────────
const DISPLAY_PLATFORMS: Platform[] = [
  'x', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok', 'threads',
];

// Platforms not yet supported by oauth-callback
const COMING_SOON: Platform[] = ['tiktok', 'threads'];

interface ConnectedAccount {
  id: string;
  platform: Platform;
  platform_username: string | null;
  platform_user_id: string | null;
  created_at: string;
  is_active: boolean;
}

// Platform icons — replace with SVG assets in production
const PLATFORM_ICON: Record<Platform, string> = {
  x:         '𝕏',
  instagram: '📸',
  facebook:  'f',
  tiktok:    '🎵',
  youtube:   '▶',
  linkedin:  'in',
  threads:   '@',
};

export default function AccountsScreen() {
  const [accounts, setAccounts]     = useState<ConnectedAccount[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState<Platform | null>(null);

  // ─── Load connected accounts ───────────────────────────────────────────────

  const loadAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('id, platform, platform_username, platform_user_id, created_at, is_active')
      .order('created_at', { ascending: true });

    if (error) {
      Alert.alert('خطأ', `فشل تحميل الحسابات: ${error.message}`);
    } else {
      setAccounts((data ?? []) as ConnectedAccount[]);
    }
  }, []);

  useEffect(() => {
    loadAccounts().finally(() => setLoading(false));
  }, [loadAccounts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  }, [loadAccounts]);

  // ─── Deep-link listener (oauth return) ────────────────────────────────────

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      const parsed = Linking.parse(url);
      // Matches social-media-manager://oauth?platform=x&username=...
      if (parsed.path === 'oauth' || parsed.hostname === 'oauth') {
        const platform = parsed.queryParams?.platform as string | undefined;
        const error    = parsed.queryParams?.error    as string | undefined;
        if (error) {
          Alert.alert('فشل الربط', decodeURIComponent(error));
        } else if (platform) {
          const label = PLATFORM_META[platform as Platform]?.labelAr ?? platform;
          Alert.alert('تم الربط ✓', `تم ربط حساب ${label} بنجاح!`);
          loadAccounts();
        }
        setConnecting(null);
      }
    });
    return () => sub.remove();
  }, [loadAccounts]);

  // ─── Connect a platform ────────────────────────────────────────────────────

  const handleConnect = useCallback(async (platform: Platform) => {
    setConnecting(platform);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مسجّل الدخول');

      const redirectApp = Linking.createURL('oauth');

      // Initiate: edge function builds the platform OAuth URL and 302s there
      const oauthInitUrl = [
        `${supabaseUrl}/functions/v1/oauth-callback`,
        `?platform=${encodeURIComponent(platform)}`,
        `&user_id=${encodeURIComponent(user.id)}`,
        `&redirect_app=${encodeURIComponent(redirectApp)}`,
      ].join('');

      const result = await WebBrowser.openAuthSessionAsync(oauthInitUrl, redirectApp);

      // 'success' → Linking listener fires; 'cancel'/'dismiss' → clear spinner
      if (result.type !== 'success') {
        setConnecting(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('خطأ', msg);
      setConnecting(null);
    }
  }, []);

  // ─── Disconnect a platform ─────────────────────────────────────────────────

  const handleDisconnect = useCallback((account: ConnectedAccount) => {
    const label = PLATFORM_META[account.platform].labelAr;
    Alert.alert(
      'فصل الحساب',
      `هل تريد فصل حساب ${label}${account.platform_username ? ` (@${account.platform_username})` : ''}؟\nسيتم حذف رمز الوصول فوراً.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'فصل الحساب',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('social_accounts')
              .delete()
              .eq('id', account.id);
            if (error) {
              Alert.alert('خطأ', error.message);
            } else {
              setAccounts(prev => prev.filter(a => a.id !== account.id));
            }
          },
        },
      ],
    );
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const connectedMap = new Map(accounts.map(a => [a.platform, a]));

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="px-4 pt-6 pb-16"
      style={{ direction: 'rtl' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      {/* Header */}
      <Text className="text-2xl font-bold text-gray-900 mb-1 text-right">الحسابات المرتبطة</Text>
      <Text className="text-sm text-gray-400 mb-8 text-right">
        {accounts.length > 0
          ? `${accounts.length} من ${DISPLAY_PLATFORMS.length - COMING_SOON.length} منصات مرتبطة`
          : 'اربط منصاتك لتتمكن من النشر المباشر'}
      </Text>

      {/* Platform cards */}
      <View className="gap-3">
        {DISPLAY_PLATFORMS.map(platform => {
          const meta        = PLATFORM_META[platform];
          const account     = connectedMap.get(platform);
          const isConnected = !!account;
          const isComingSoon = COMING_SOON.includes(platform);
          const isLoading   = connecting === platform;
          const connectedDate = account
            ? new Date(account.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
              })
            : null;

          return (
            <View
              key={platform}
              className={`rounded-2xl border flex-row items-center p-4 ${
                isConnected
                  ? 'border-green-200 bg-white'
                  : isComingSoon
                  ? 'border-gray-100 bg-white opacity-60'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Platform icon badge */}
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center ml-4 flex-shrink-0"
                style={{ backgroundColor: meta.color }}
              >
                <Text className="text-white font-black text-base">{PLATFORM_ICON[platform]}</Text>
              </View>

              {/* Name + status */}
              <View className="flex-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-base font-semibold text-gray-900">{meta.labelAr}</Text>
                  {isConnected && (
                    <View className="bg-green-100 rounded-full px-2 py-0.5">
                      <Text className="text-xs text-green-700 font-medium">مرتبط ✓</Text>
                    </View>
                  )}
                  {isComingSoon && (
                    <View className="bg-amber-100 rounded-full px-2 py-0.5">
                      <Text className="text-xs text-amber-700">قريباً</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {isConnected && account?.platform_username
                    ? `@${account.platform_username} · ${connectedDate}`
                    : isConnected
                    ? connectedDate ?? ''
                    : isComingSoon
                    ? 'سيتوفر قريباً'
                    : 'غير مرتبط'}
                </Text>
              </View>

              {/* Action button */}
              {!isComingSoon && (
                isConnected ? (
                  <TouchableOpacity
                    onPress={() => account && handleDisconnect(account)}
                    className="border border-red-200 rounded-xl px-3 py-2"
                  >
                    <Text className="text-red-500 text-sm font-medium">فصل</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleConnect(platform)}
                    disabled={connecting !== null}
                    className={`rounded-xl px-4 py-2 ${
                      connecting ? 'bg-indigo-200' : 'bg-indigo-600'
                    }`}
                    style={{ minWidth: 80, alignItems: 'center' }}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-sm font-semibold">ربط</Text>
                    )}
                  </TouchableOpacity>
                )
              )}
            </View>
          );
        })}
      </View>

      {/* Security note */}
      <View className="mt-8 bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
        <Text className="text-sm font-semibold text-indigo-900 text-right mb-1">🔒 أمان رموز الوصول</Text>
        <Text className="text-xs text-indigo-700 text-right leading-6">
          رموز الوصول الخاصة بك مشفّرة باستخدام AES-256 (pgcrypto) ومحمية داخل Supabase Vault.
          لا يمكن لأي طرف — بما فيه فريق التطوير — الاطلاع عليها. فصل أي حساب يحذف الرمز فوراً.
        </Text>
      </View>
    </ScrollView>
  );
}
