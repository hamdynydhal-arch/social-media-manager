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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import {
  Platform,
  PLATFORM_META,
  VISUAL_PLATFORMS,
  TEXT_PLATFORMS,
} from '../constants/platforms';

const ALL_PLATFORMS: Platform[] = [...TEXT_PLATFORMS, ...VISUAL_PLATFORMS];

interface PickedMedia {
  uri: string;
  mimeType: string;
  fileName: string;
}

interface Props {
  onSuccess?: (postGroupId: string) => void;
}

export default function UnifiedPostForm({ onSuccess }: Props) {
  const [baseText, setBaseText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());
  const [aiEnabled, setAiEnabled] = useState(true);
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const togglePlatform = useCallback((p: Platform) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }, []);

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

  const removeMedia = useCallback(() => setMedia(null), []);

  const uploadMedia = async (userId: string): Promise<{ assetId: string; publicUrl: string } | null> => {
    if (!media) return null;

    const response = await fetch(media.uri);
    const blob = await response.blob();
    const ext = media.fileName.split('.').pop() ?? 'jpg';
    const storagePath = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('media-assets')
      .upload(storagePath, blob, { contentType: media.mimeType, upsert: false });

    if (uploadError) throw new Error(`فشل رفع الملف: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from('media-assets').getPublicUrl(storagePath);

    const { data: assetRow, error: dbError } = await supabase
      .from('media_assets')
      .insert({
        user_id: userId,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        mime_type: media.mimeType,
      })
      .select('id')
      .single();

    if (dbError) throw new Error(`فشل حفظ بيانات الملف: ${dbError.message}`);

    return { assetId: assetRow.id, publicUrl: urlData.publicUrl };
  };

  const handleSubmit = async () => {
    if (!baseText.trim() && !media) {
      Alert.alert('محتوى فارغ', 'أدخل نصاً أو اختر وسيطاً قبل النشر.');
      return;
    }
    if (selectedPlatforms.size === 0) {
      Alert.alert('اختر منصة', 'اختر منصة واحدة على الأقل للنشر.');
      return;
    }

    // Text-only platforms require text
    const hasTextPlatform = [...selectedPlatforms].some(p => TEXT_PLATFORMS.includes(p));
    if (hasTextPlatform && !baseText.trim()) {
      Alert.alert('النص مطلوب', 'منصات النص (إكس، لينكد إن، فيسبوك، ثريدز) تحتاج إلى نص.');
      return;
    }
    // Visual platforms require media
    const hasVisualPlatform = [...selectedPlatforms].some(p => VISUAL_PLATFORMS.includes(p));
    if (hasVisualPlatform && !media) {
      Alert.alert('الوسيط مطلوب', 'منصات الفيديو (تيك توك، إنستغرام، يوتيوب) تحتاج إلى وسيط.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مسجّل الدخول');

      const uploadResult = await uploadMedia(user.id);

      const { data: group, error: groupError } = await supabase
        .from('post_groups')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      if (groupError) throw new Error(groupError.message);

      const rows = [...selectedPlatforms].map(platform => ({
        user_id: user.id,
        platform,
        base_text: baseText.trim() || null,
        media_asset_ids: uploadResult ? [uploadResult.assetId] : null,
        post_group_id: group.id,
        status: 'pending',
      }));

      const { error: postsError } = await supabase.from('posts').insert(rows);
      if (postsError) throw new Error(postsError.message);

      // Trigger the edge function asynchronously
      supabase.functions.invoke('process-post-queue', {
        body: {
          postGroupId: group.id,
          aiEnabled,
          mediaUrl: uploadResult?.publicUrl ?? null,
        },
      });

      Alert.alert('تم الإرسال ✓', 'جاري معالجة المنشورات وإرسالها.');
      setBaseText('');
      setSelectedPlatforms(new Set());
      setMedia(null);
      setAiEnabled(true);
      onSuccess?.(group.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      Alert.alert('خطأ', msg);
    } finally {
      setSubmitting(false);
    }
  };

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
        style={{ fontFamily: 'System', lineHeight: 26 }}
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
              <Text className="text-4xl">🎬</Text>
              <Text className="text-gray-500 text-sm mt-2">{media.fileName}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={removeMedia}
            className="absolute top-2 left-2 bg-black/60 rounded-full w-8 h-8 items-center justify-center"
          >
            <Text className="text-white text-base font-bold">✕</Text>
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
          const meta = PLATFORM_META[p];
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
              <Text
                className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-600'}`}
              >
                {meta.labelAr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* AI toggle */}
      <View className="flex-row items-center justify-between bg-brand-50 rounded-2xl px-4 py-4 mb-8 border border-brand-100">
        <Switch
          value={aiEnabled}
          onValueChange={setAiEnabled}
          trackColor={{ false: '#d1d5db', true: '#6366f1' }}
          thumbColor={aiEnabled ? '#ffffff' : '#f3f4f6'}
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
          <Text className="text-white font-bold text-base">إرسال المنشورات</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
