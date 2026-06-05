import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import {
  Platform,
  PLATFORM_META,
  VISUAL_PLATFORMS,
  TEXT_PLATFORMS,
} from '../constants/platforms';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_PLATFORMS: Platform[] = [...TEXT_PLATFORMS, ...VISUAL_PLATFORMS];

const COUNTRIES = [
  { key: 'Qatar',        labelAr: 'قطر',              tz: 'Asia/Qatar'        },
  { key: 'Saudi Arabia', labelAr: 'السعودية',          tz: 'Asia/Riyadh'       },
  { key: 'UAE',          labelAr: 'الإمارات',          tz: 'Asia/Dubai'        },
  { key: 'Kuwait',       labelAr: 'الكويت',            tz: 'Asia/Kuwait'       },
  { key: 'Bahrain',      labelAr: 'البحرين',           tz: 'Asia/Bahrain'      },
  { key: 'Oman',         labelAr: 'عُمان',             tz: 'Asia/Muscat'       },
  { key: 'Jordan',       labelAr: 'الأردن',            tz: 'Asia/Amman'        },
  { key: 'Lebanon',      labelAr: 'لبنان',             tz: 'Asia/Beirut'       },
  { key: 'Egypt',        labelAr: 'مصر',               tz: 'Africa/Cairo'      },
  { key: 'Tunisia',      labelAr: 'تونس',              tz: 'Africa/Tunis'      },
  { key: 'Morocco',      labelAr: 'المغرب',            tz: 'Africa/Casablanca' },
  { key: 'Turkey',       labelAr: 'تركيا',             tz: 'Europe/Istanbul'   },
  { key: 'UK',           labelAr: 'المملكة المتحدة',   tz: 'Europe/London'     },
  { key: 'USA',          labelAr: 'الولايات المتحدة',  tz: 'America/New_York'  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface PickedMedia {
  uri: string;
  mimeType: string;
  fileName: string;
}

interface SuggestResponse {
  recommended_timestamp: string;
  timezone: string;
  explanation_ar: string;
}

interface Props {
  onSuccess?: (postGroupId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLocalDateTime(iso: string, tz: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: tz,
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UnifiedPostForm({ onSuccess }: Props) {
  const [baseText, setBaseText]             = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());
  const [aiEnabled, setAiEnabled]           = useState(true);
  const [media, setMedia]                   = useState<PickedMedia | null>(null);
  const [submitting, setSubmitting]         = useState(false);

  // Country picker
  const [targetCountry, setTargetCountry]   = useState(COUNTRIES[0]);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  // Scheduling + peak time
  const [scheduledAt, setScheduledAt]       = useState<string | null>(null);
  const [suggestingTime, setSuggestingTime] = useState(false);
  const [timeExplanation, setTimeExplanation] = useState<string | null>(null);

  // ─── Platform toggle ─────────────────────────────────────────────────────

  const togglePlatform = useCallback((p: Platform) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }, []);

  // ─── Media picker ─────────────────────────────────────────────────────────

  const pickMedia = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('الإذن مطلوب', 'يرجى السماح بالوصول إلى مكتبة الصور.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
      allowsMultipleSelection: false,
      videoMaxDuration: 180,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setMedia({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileName: asset.fileName ?? `media_${Date.now()}`,
    });
  }, []);

  // ─── Media upload ─────────────────────────────────────────────────────────

  const uploadMedia = async (userId: string): Promise<{ assetId: string; publicUrl: string } | null> => {
    if (!media) return null;
    const response = await fetch(media.uri);
    const blob     = await response.blob();
    const ext      = media.fileName.split('.').pop() ?? 'jpg';
    const path     = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('media-assets')
      .upload(path, blob, { contentType: media.mimeType, upsert: false });
    if (uploadError) throw new Error(`فشل رفع الملف: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from('media-assets').getPublicUrl(path);
    const { data: asset, error: dbErr } = await supabase
      .from('media_assets')
      .insert({ user_id: userId, storage_path: path, public_url: urlData.publicUrl, mime_type: media.mimeType })
      .select('id')
      .single();
    if (dbErr) throw new Error(dbErr.message);
    return { assetId: asset.id, publicUrl: urlData.publicUrl };
  };

  // ─── AI peak-time suggestion ─────────────────────────────────────────────

  const suggestBestTime = useCallback(async () => {
    if (selectedPlatforms.size === 0) {
      Alert.alert('اختر منصة أولاً', 'حدد المنصات المستهدفة ثم اطلب اقتراح الوقت.');
      return;
    }
    setSuggestingTime(true);
    setTimeExplanation(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;

      const res = await fetch(`${supabaseUrl}/functions/v1/suggest-peak-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          base_text:          baseText.trim(),
          target_country:     targetCountry.key,
          selected_platforms: [...selectedPlatforms],
          current_iso:        new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const data: SuggestResponse = await res.json();
      setScheduledAt(data.recommended_timestamp);
      setTimeExplanation(data.explanation_ar);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('خطأ في الاقتراح', msg);
    } finally {
      setSuggestingTime(false);
    }
  }, [baseText, selectedPlatforms, targetCountry]);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!baseText.trim() && !media) {
      Alert.alert('محتوى فارغ', 'أدخل نصاً أو اختر وسيطاً قبل النشر.');
      return;
    }
    if (selectedPlatforms.size === 0) {
      Alert.alert('اختر منصة', 'اختر منصة واحدة على الأقل للنشر.');
      return;
    }

    const hasText   = [...selectedPlatforms].some(p => TEXT_PLATFORMS.includes(p));
    const hasVisual = [...selectedPlatforms].some(p => VISUAL_PLATFORMS.includes(p));
    if (hasText && !baseText.trim()) {
      Alert.alert('النص مطلوب', 'منصات النص (إكس، لينكد إن…) تحتاج إلى نص.');
      return;
    }
    if (hasVisual && !media) {
      Alert.alert('الوسيط مطلوب', 'منصات الفيديو (تيك توك، إنستغرام…) تحتاج إلى وسيط.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مسجّل الدخول');

      // Strict platform guard: only create rows for platforms the user toggled ON
      const activePlatforms = [...selectedPlatforms];
      if (activePlatforms.length === 0) throw new Error('لم يتم اختيار أي منصة');

      const uploadResult = await uploadMedia(user.id);

      const { data: group, error: groupErr } = await supabase
        .from('post_groups')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      if (groupErr) throw new Error(groupErr.message);

      // One row per explicitly selected platform — never more
      const rows = activePlatforms.map(platform => ({
        user_id:         user.id,
        platform,
        base_text:       baseText.trim() || null,
        media_asset_ids: uploadResult ? [uploadResult.assetId] : null,
        post_group_id:   group.id,
        scheduled_at:    scheduledAt ?? null,
        status:          'pending',
      }));

      const { error: postsErr } = await supabase.from('posts').insert(rows);
      if (postsErr) throw new Error(postsErr.message);

      // Trigger AI adaptation + publish pipeline (fire-and-forget)
      supabase.functions.invoke('process-post-queue', {
        body: {
          postGroupId:   group.id,
          aiEnabled,
          mediaUrl:      uploadResult?.publicUrl ?? null,
          targetCountry: targetCountry.key,
        },
      });

      Alert.alert(
        'تم الإرسال ✓',
        scheduledAt
          ? `سيُنشر المحتوى في ${formatLocalDateTime(scheduledAt, targetCountry.tz)}`
          : 'جاري معالجة المنشورات وإرسالها.',
      );
      // Reset form
      setBaseText('');
      setSelectedPlatforms(new Set());
      setMedia(null);
      setAiEnabled(true);
      setScheduledAt(null);
      setTimeExplanation(null);
      onSuccess?.(group.id);
    } catch (err: unknown) {
      Alert.alert('خطأ', err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="px-4 pt-6 pb-12"
      keyboardShouldPersistTaps="handled"
      style={{ direction: 'rtl' }}
    >
      {/* Header */}
      <Text className="text-2xl font-bold text-gray-900 mb-1 text-right">منشور جديد</Text>
      <Text className="text-sm text-gray-400 mb-6 text-right">انشر على أكثر من منصة دفعة واحدة</Text>

      {/* Base text */}
      <Text className="text-sm font-semibold text-gray-700 mb-2 text-right">النص الأساسي</Text>
      <TextInput
        className="border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base bg-gray-50 min-h-[140px]"
        placeholder="اكتب محتواك هنا…"
        placeholderTextColor="#9ca3af"
        multiline
        textAlignVertical="top"
        textAlign="right"
        value={baseText}
        onChangeText={setBaseText}
        style={{ lineHeight: 26 }}
      />
      <Text className="text-xs text-gray-400 mt-1 mb-6 text-right">{baseText.length} حرف</Text>

      {/* Media picker */}
      <Text className="text-sm font-semibold text-gray-700 mb-2 text-right">الوسائط</Text>
      {media ? (
        <View className="rounded-2xl overflow-hidden mb-6 border border-gray-200">
          {media.mimeType.startsWith('image') && (
            <Image source={{ uri: media.uri }} className="w-full h-48" resizeMode="cover" />
          )}
          {media.mimeType.startsWith('video') && (
            <View className="w-full h-48 bg-gray-100 items-center justify-center">
              <Text className="text-5xl">🎬</Text>
              <Text className="text-gray-500 text-sm mt-2">{media.fileName}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => setMedia(null)}
            className="absolute top-2 left-2 bg-black/60 rounded-full w-8 h-8 items-center justify-center"
          >
            <Text className="text-white font-bold">✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickMedia}
          className="border-2 border-dashed border-gray-300 rounded-2xl h-32 items-center justify-center mb-6 bg-gray-50"
        >
          <Text className="text-3xl mb-1">📎</Text>
          <Text className="text-gray-500 text-sm">اضغط لاختيار صورة أو فيديو</Text>
        </TouchableOpacity>
      )}

      {/* Platform selector */}
      <Text className="text-sm font-semibold text-gray-700 mb-3 text-right">المنصات</Text>
      <View className="flex-row flex-wrap gap-2 mb-6 justify-end">
        {ALL_PLATFORMS.map(p => {
          const meta   = PLATFORM_META[p];
          const active = selectedPlatforms.has(p);
          return (
            <TouchableOpacity
              key={p}
              onPress={() => togglePlatform(p)}
              className={`flex-row items-center px-3 py-2 rounded-xl border ${
                active ? 'border-transparent' : 'border-gray-200 bg-gray-50'
              }`}
              style={active ? { backgroundColor: meta.color } : undefined}
            >
              <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-600'}`}>
                {meta.labelAr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Target country */}
      <Text className="text-sm font-semibold text-gray-700 mb-2 text-right">البلد المستهدف</Text>
      <TouchableOpacity
        onPress={() => setCountryPickerOpen(true)}
        className="border border-gray-200 rounded-2xl px-4 py-3 mb-6 bg-gray-50 flex-row items-center justify-between"
      >
        <Text className="text-gray-400 text-sm">🌍</Text>
        <Text className="text-gray-900 text-base font-medium">{targetCountry.labelAr}</Text>
      </TouchableOpacity>

      {/* Scheduling row */}
      <Text className="text-sm font-semibold text-gray-700 mb-3 text-right">وقت النشر</Text>
      <View className="flex-row items-center gap-3 mb-2">
        {/* Suggest best time button */}
        <TouchableOpacity
          onPress={suggestBestTime}
          disabled={suggestingTime}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 border ${
            suggestingTime ? 'border-violet-200 bg-violet-50' : 'border-violet-300 bg-violet-50'
          }`}
        >
          {suggestingTime ? (
            <ActivityIndicator size="small" color="#7c3aed" />
          ) : (
            <Text className="text-base">✨</Text>
          )}
          <Text className={`text-sm font-semibold ${suggestingTime ? 'text-violet-400' : 'text-violet-700'}`}>
            {suggestingTime ? 'جاري التحليل…' : 'اقتراح أفضل وقت'}
          </Text>
        </TouchableOpacity>

        {/* Clear schedule */}
        {scheduledAt && (
          <TouchableOpacity
            onPress={() => { setScheduledAt(null); setTimeExplanation(null); }}
            className="border border-gray-200 rounded-xl px-3 py-3"
          >
            <Text className="text-gray-400 text-sm">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scheduled time display */}
      {scheduledAt && (
        <View className="bg-violet-50 rounded-2xl p-4 mb-2 border border-violet-100">
          <Text className="text-xs text-violet-500 mb-1 text-right">موعد النشر المقترح</Text>
          <Text className="text-sm font-bold text-violet-900 text-right">
            {formatLocalDateTime(scheduledAt, targetCountry.tz)}
          </Text>
        </View>
      )}

      {/* AI time explanation */}
      {timeExplanation && (
        <View className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-100">
          <Text className="text-xs text-amber-600 mb-1 text-right font-semibold">💡 تحليل الذكاء الاصطناعي</Text>
          <Text className="text-sm text-amber-900 text-right leading-6">{timeExplanation}</Text>
        </View>
      )}

      {!scheduledAt && <View className="mb-6" />}

      {/* AI content adaptation toggle */}
      <View className="flex-row items-center justify-between bg-indigo-50 rounded-2xl px-4 py-4 mb-8 border border-indigo-100">
        <Switch
          value={aiEnabled}
          onValueChange={setAiEnabled}
          trackColor={{ false: '#d1d5db', true: '#6366f1' }}
          thumbColor="#ffffff"
        />
        <View className="flex-1 mr-3 items-end">
          <Text className="text-sm font-semibold text-gray-800 text-right">
            تخصيص المحتوى بالذكاء الاصطناعي
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5 text-right">
            يعيد كلود صياغة النص لكل منصة تلقائياً
          </Text>
        </View>
        <Text className="text-2xl mr-1">🤖</Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        className={`rounded-2xl py-4 items-center ${submitting ? 'bg-indigo-300' : 'bg-indigo-600'}`}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-base">
            {scheduledAt ? 'جدولة المنشورات' : 'إرسال المنشورات'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Country picker modal */}
      <Modal
        visible={countryPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryPickerOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setCountryPickerOpen(false)}
        />
        <View className="bg-white rounded-t-3xl pb-10" style={{ direction: 'rtl' }}>
          <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setCountryPickerOpen(false)}>
              <Text className="text-indigo-600 font-semibold">تم</Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-gray-900">اختر البلد المستهدف</Text>
            <View style={{ width: 32 }} />
          </View>
          <FlatList
            data={COUNTRIES}
            keyExtractor={c => c.key}
            style={{ maxHeight: 340 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { setTargetCountry(item); setCountryPickerOpen(false); }}
                className={`flex-row items-center justify-between px-6 py-4 border-b border-gray-50 ${
                  item.key === targetCountry.key ? 'bg-indigo-50' : ''
                }`}
              >
                <Text className={`text-sm ${item.key === targetCountry.key ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                  {item.key === targetCountry.key ? '✓' : ''}
                </Text>
                <Text className={`text-base ${item.key === targetCountry.key ? 'text-indigo-700 font-semibold' : 'text-gray-800'}`}>
                  {item.labelAr}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
