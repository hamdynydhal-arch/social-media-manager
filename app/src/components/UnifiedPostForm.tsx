import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Switch, Alert, ActivityIndicator, Image, Modal, FlatList,
  Platform as RNPlatform, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Colors, Shadows, Radii } from '../constants/theme';
import {
  Platform, PLATFORM_META, VISUAL_PLATFORMS, TEXT_PLATFORMS,
} from '../constants/platforms';

const isWeb = RNPlatform.OS === 'web';
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

interface PickedMedia { uri: string; mimeType: string; fileName: string; }
interface SuggestResponse { recommended_timestamp: string; timezone: string; explanation_ar: string; }
interface Props { onSuccess?: (postGroupId: string) => void; }

function formatLocalDateTime(iso: string, tz: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: tz, weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch { return iso; }
}

// ── Section label ──────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={{
      fontSize: 12, fontWeight: '700', color: Colors.text.muted,
      textAlign: 'right', marginBottom: 8, marginRight: 2,
      textTransform: 'uppercase', letterSpacing: 0.6,
    }}>
      {children}
    </Text>
  );
}

// ── Card wrapper ───────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[{
      backgroundColor: Colors.surface, borderRadius: Radii.card, padding: 16,
      borderWidth: 1, borderColor: Colors.surfaceFaint, marginBottom: 16,
      ...Shadows.card,
    }, style]}>
      {children}
    </View>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function UnifiedPostForm({ onSuccess }: Props) {
  const [baseText, setBaseText]                   = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());
  const [aiEnabled, setAiEnabled]                 = useState(true);
  const [media, setMedia]                         = useState<PickedMedia | null>(null);
  const [submitting, setSubmitting]               = useState(false);
  const [targetCountry, setTargetCountry]         = useState(COUNTRIES[0]);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [scheduledAt, setScheduledAt]             = useState<string | null>(null);
  const [suggestingTime, setSuggestingTime]       = useState(false);
  const [timeExplanation, setTimeExplanation]     = useState<string | null>(null);

  const togglePlatform = useCallback((p: Platform) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }, []);

  const pickMedia = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('الإذن مطلوب', 'يرجى السماح بالوصول إلى مكتبة الصور.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'], quality: 0.85,
      allowsMultipleSelection: false, videoMaxDuration: 180,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setMedia({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg', fileName: asset.fileName ?? `media_${Date.now()}` });
  }, []);

  const uploadMedia = async (userId: string): Promise<{ assetId: string; publicUrl: string } | null> => {
    if (!media) return null;
    const response = await fetch(media.uri);
    const blob     = await response.blob();
    const ext      = media.fileName.split('.').pop() ?? 'jpg';
    const path     = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('media-assets').upload(path, blob, { contentType: media.mimeType, upsert: false });
    if (uploadError) throw new Error(`فشل رفع الملف: ${uploadError.message}`);
    const { data: urlData } = supabase.storage.from('media-assets').getPublicUrl(path);
    const { data: asset, error: dbErr } = await supabase.from('media_assets').insert({ user_id: userId, storage_path: path, public_url: urlData.publicUrl, mime_type: media.mimeType }).select('id').single();
    if (dbErr) throw new Error(dbErr.message);
    return { assetId: asset.id, publicUrl: urlData.publicUrl };
  };

  const suggestBestTime = useCallback(async () => {
    if (selectedPlatforms.size === 0) { Alert.alert('اختر منصة أولاً', 'حدد المنصات المستهدفة ثم اطلب اقتراح الوقت.'); return; }
    setSuggestingTime(true); setTimeExplanation(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      const res = await fetch(`${supabaseUrl}/functions/v1/suggest-peak-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ base_text: baseText.trim(), target_country: targetCountry.key, selected_platforms: [...selectedPlatforms], current_iso: new Date().toISOString() }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error ?? `HTTP ${res.status}`); }
      const data: SuggestResponse = await res.json();
      setScheduledAt(data.recommended_timestamp);
      setTimeExplanation(data.explanation_ar);
    } catch (err: unknown) {
      Alert.alert('خطأ في الاقتراح', err instanceof Error ? err.message : String(err));
    } finally { setSuggestingTime(false); }
  }, [baseText, selectedPlatforms, targetCountry]);

  const handleSubmit = async () => {
    if (!baseText.trim() && !media) { Alert.alert('محتوى فارغ', 'أدخل نصاً أو اختر وسيطاً قبل النشر.'); return; }
    if (selectedPlatforms.size === 0) { Alert.alert('اختر منصة', 'اختر منصة واحدة على الأقل للنشر.'); return; }
    const hasText   = [...selectedPlatforms].some(p => TEXT_PLATFORMS.includes(p));
    const hasVisual = [...selectedPlatforms].some(p => VISUAL_PLATFORMS.includes(p));
    if (hasText && !baseText.trim()) { Alert.alert('النص مطلوب', 'منصات النص (إكس، لينكد إن…) تحتاج إلى نص.'); return; }
    if (hasVisual && !media) { Alert.alert('الوسيط مطلوب', 'منصات الفيديو (تيك توك، إنستغرام…) تحتاج إلى وسيط.'); return; }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مسجّل الدخول');
      const activePlatforms = [...selectedPlatforms];
      const uploadResult = await uploadMedia(user.id);
      const { data: group, error: groupErr } = await supabase.from('post_groups').insert({ user_id: user.id }).select('id').single();
      if (groupErr) throw new Error(groupErr.message);
      const rows = activePlatforms.map(platform => ({
        user_id: user.id, platform, base_text: baseText.trim() || null,
        media_asset_ids: uploadResult ? [uploadResult.assetId] : null,
        post_group_id: group.id, scheduled_at: scheduledAt ?? null, status: 'pending',
      }));
      const { error: postsErr } = await supabase.from('posts').insert(rows);
      if (postsErr) throw new Error(postsErr.message);
      supabase.functions.invoke('process-post-queue', { body: { postGroupId: group.id, aiEnabled, mediaUrl: uploadResult?.publicUrl ?? null, targetCountry: targetCountry.key } });
      Alert.alert('تم الإرسال ✓', scheduledAt ? `سيُنشر المحتوى في ${formatLocalDateTime(scheduledAt, targetCountry.tz)}` : 'جاري معالجة المنشورات وإرسالها.');
      setBaseText(''); setSelectedPlatforms(new Set()); setMedia(null);
      setAiEnabled(true); setScheduledAt(null); setTimeExplanation(null);
      onSuccess?.(group.id);
    } catch (err: unknown) {
      Alert.alert('خطأ', err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally { setSubmitting(false); }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 48,
          ...(isWeb ? { maxWidth: 700, alignSelf: 'center' as const, width: '100%' } : {}),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{
          backgroundColor: Colors.dark.header,
          paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36,
          borderBottomLeftRadius: Radii.header, borderBottomRightRadius: Radii.header,
          marginBottom: -18, overflow: 'hidden',
        }}>
          <View style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: Colors.cyan.glow }} />
          <View style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.purple.glow }} />
          <View style={{ position: 'absolute', top: 10, right: '40%', width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.pink.glow }} />
          <Text style={{ color: Colors.text.onDarkSub, fontSize: 13, textAlign: 'right' }}>النشر الذكي</Text>
          <Text style={{ color: Colors.text.onDark, fontSize: 24, fontWeight: '900', textAlign: 'right' }}>منشور جديد</Text>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'right', marginTop: 4 }}>انشر على أكثر من منصة دفعة واحدة</Text>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 30 }}>

          {/* ── Base text ── */}
          <SectionLabel>النص الأساسي</SectionLabel>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <TextInput
              style={{
                padding: 16, fontSize: 15, color: Colors.text.primary,
                minHeight: 140, textAlignVertical: 'top', textAlign: 'right', lineHeight: 26,
              }}
              placeholder="اكتب محتواك هنا…"
              placeholderTextColor={Colors.text.faint}
              multiline
              value={baseText}
              onChangeText={setBaseText}
            />
            <View style={{
              borderTopWidth: 1, borderTopColor: Colors.surfaceFaint,
              paddingHorizontal: 16, paddingVertical: 8,
              flexDirection: 'row', justifyContent: 'flex-end',
            }}>
              <Text style={{ fontSize: 11, color: Colors.text.faint }}>
                {baseText.length} حرف
              </Text>
            </View>
          </Card>

          {/* ── Media ── */}
          <SectionLabel>الوسائط</SectionLabel>
          {media ? (
            <View style={{ borderRadius: Radii.card, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: Colors.surfaceFaint }}>
              {media.mimeType.startsWith('image') && (
                <Image source={{ uri: media.uri }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
              )}
              {media.mimeType.startsWith('video') && (
                <View style={{ width: '100%', height: 180, backgroundColor: Colors.surfaceFaint, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 48 }}>🎬</Text>
                  <Text style={{ color: Colors.text.muted, fontSize: 13, marginTop: 8 }}>{media.fileName}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => setMedia(null)}
                style={{
                  position: 'absolute', top: 10, left: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
                  width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickMedia}
              style={{
                borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.cyan.lighter,
                borderRadius: Radii.card, height: 110,
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                backgroundColor: Colors.cyan.faint,
              }}
            >
              <Text style={{ fontSize: 30, marginBottom: 6 }}>📎</Text>
              <Text style={{ color: Colors.cyan.DEFAULT, fontSize: 13, fontWeight: '600' }}>اضغط لاختيار صورة أو فيديو</Text>
            </TouchableOpacity>
          )}

          {/* ── Platforms ── */}
          <SectionLabel>المنصات</SectionLabel>
          <Card>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
              {ALL_PLATFORMS.map(p => {
                const meta   = PLATFORM_META[p];
                const active = selectedPlatforms.has(p);
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => togglePlatform(p)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.md,
                      borderWidth: 1.5,
                      borderColor: active ? meta.color : Colors.surfaceFaint,
                      backgroundColor: active ? meta.color : Colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#FFF' : Colors.text.secondary }}>
                      {meta.labelAr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* ── Country ── */}
          <SectionLabel>البلد المستهدف</SectionLabel>
          <TouchableOpacity
            onPress={() => setCountryPickerOpen(true)}
            style={{
              backgroundColor: Colors.surface, borderRadius: Radii.card, marginBottom: 16,
              borderWidth: 1, borderColor: Colors.surfaceFaint,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 16, paddingVertical: 14,
              ...Shadows.card,
            }}
          >
            <Text style={{ color: Colors.text.faint, fontSize: 16 }}>🌍</Text>
            <View style={{ flex: 1, alignItems: 'flex-end', marginHorizontal: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text.primary }}>{targetCountry.labelAr}</Text>
            </View>
            <Text style={{ color: Colors.text.faint }}>›</Text>
          </TouchableOpacity>

          {/* ── Scheduling ── */}
          <SectionLabel>وقت النشر</SectionLabel>
          <TouchableOpacity
            onPress={suggestBestTime}
            disabled={suggestingTime}
            style={{
              borderRadius: Radii.lg, paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: Colors.purple.DEFAULT, marginBottom: 12,
              ...Shadows.purple,
              opacity: suggestingTime ? 0.75 : 1,
            }}
          >
            {suggestingTime
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Text style={{ fontSize: 16 }}>✨</Text>
            }
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>
              {suggestingTime ? 'جاري التحليل…' : 'اقتراح أفضل وقت بالذكاء الاصطناعي'}
            </Text>
          </TouchableOpacity>

          {scheduledAt && (
            <View style={{
              backgroundColor: Colors.purple.faint, borderRadius: Radii.lg, padding: 14,
              marginBottom: 10, borderWidth: 1, borderColor: `${Colors.purple.DEFAULT}30`,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <TouchableOpacity onPress={() => { setScheduledAt(null); setTimeExplanation(null); }}>
                <Text style={{ color: Colors.text.faint, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 10 }}>
                <Text style={{ fontSize: 10, color: Colors.purple.DEFAULT, fontWeight: '700', marginBottom: 3 }}>موعد النشر المقترح</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.dark.header, textAlign: 'right' }}>
                  {formatLocalDateTime(scheduledAt, targetCountry.tz)}
                </Text>
              </View>
              <Text style={{ fontSize: 20 }}>📅</Text>
            </View>
          )}

          {timeExplanation && (
            <View style={{
              backgroundColor: Colors.gold.faint, borderRadius: Radii.lg, padding: 14,
              marginBottom: 16, borderWidth: 1, borderColor: `${Colors.gold.DEFAULT}40`,
            }}>
              <Text style={{ fontSize: 11, color: Colors.gold.dark, fontWeight: '700', textAlign: 'right', marginBottom: 4 }}>💡 تحليل الذكاء الاصطناعي</Text>
              <Text style={{ fontSize: 13, color: Colors.text.secondary, textAlign: 'right', lineHeight: 22 }}>{timeExplanation}</Text>
            </View>
          )}

          {!scheduledAt && !timeExplanation && <View style={{ height: 4 }} />}

          {/* ── AI toggle ── */}
          <View style={{
            backgroundColor: Colors.dark.header, borderRadius: Radii.card,
            paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20,
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: Colors.cyan.glowStrong,
            ...Shadows.cyan,
          }}>
            <Switch
              value={aiEnabled}
              onValueChange={setAiEnabled}
              trackColor={{ false: '#374151', true: Colors.cyan.DEFAULT }}
              thumbColor="#FFFFFF"
            />
            <View style={{ flex: 1, marginRight: 12, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text.onDark, textAlign: 'right' }}>
                تخصيص المحتوى بالذكاء الاصطناعي
              </Text>
              <Text style={{ fontSize: 12, color: Colors.text.onDarkSub, marginTop: 3, textAlign: 'right' }}>
                يعيد كلود صياغة النص لكل منصة تلقائياً
              </Text>
            </View>
            <Text style={{ fontSize: 24, marginRight: 4 }}>🤖</Text>
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              borderRadius: Radii.lg, paddingVertical: 16,
              alignItems: 'center',
              backgroundColor: submitting ? Colors.cyan.lighter : Colors.cyan.DEFAULT,
              ...Shadows.cyan,
            }}
          >
            {submitting
              ? <ActivityIndicator color="#FFF" />
              : <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>
                  {scheduledAt ? '📅 جدولة المنشورات' : '🚀 إرسال المنشورات'}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Country picker modal ── */}
      <Modal visible={countryPickerOpen} transparent animationType="slide" onRequestClose={() => setCountryPickerOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setCountryPickerOpen(false)} />
        <View style={{ backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
            borderBottomWidth: 1, borderBottomColor: Colors.surfaceFaint,
          }}>
            <TouchableOpacity onPress={() => setCountryPickerOpen(false)}>
              <Text style={{ color: Colors.cyan.DEFAULT, fontWeight: '700', fontSize: 15 }}>تم</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.text.primary }}>اختر البلد المستهدف</Text>
            <View style={{ width: 32 }} />
          </View>
          <FlatList
            data={COUNTRIES}
            keyExtractor={c => c.key}
            style={{ maxHeight: 360 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { setTargetCountry(item); setCountryPickerOpen(false); }}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingHorizontal: 20, paddingVertical: 16,
                  borderBottomWidth: 1, borderBottomColor: Colors.surfaceFaint,
                  backgroundColor: item.key === targetCountry.key ? Colors.cyan.faint : 'transparent',
                }}
              >
                <Text style={{ color: item.key === targetCountry.key ? Colors.cyan.DEFAULT : Colors.text.faint, fontSize: 14, fontWeight: '700' }}>
                  {item.key === targetCountry.key ? '✓' : ''}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: item.key === targetCountry.key ? '700' : '400', color: item.key === targetCountry.key ? Colors.cyan.DEFAULT : Colors.text.primary }}>
                  {item.labelAr}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
