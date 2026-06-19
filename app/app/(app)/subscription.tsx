import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MONTHLY_PAYMENT_URL = '';
const ANNUAL_PAYMENT_URL = '';

const commonFeatures = [
  'نشر على جميع المنصات',
  'جدولة المنشورات',
  'تكييف المحتوى بالذكاء الاصطناعي',
  'إحصائيات مفصّلة',
];

const annualOnlyFeatures = [
  'أولوية في الدعم الفني',
  'سرعة معالجة قصوى للذكاء الاصطناعي',
];

export default function SubscriptionScreen() {
  const handleMonthly = () => {
    if (MONTHLY_PAYMENT_URL) Linking.openURL(MONTHLY_PAYMENT_URL);
  };

  const handleAnnual = () => {
    if (ANNUAL_PAYMENT_URL) Linking.openURL(ANNUAL_PAYMENT_URL);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ direction: 'rtl' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8 items-center">
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">اختر خطتك</Text>
          <Text className="text-gray-500 text-base text-center">
            ارقَ الآن وابدأ النشر الاحترافي على جميع المنصات
          </Text>
        </View>

        {/* ── Annual Plan Card (Hero) ── */}
        <View
          className="rounded-3xl shadow-lg mb-4 overflow-hidden"
          style={{ backgroundColor: '#6D28D9' }}
        >
          {/* Gold badge */}
          <View
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: '#facc15',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 5,
              flexDirection: 'row',
              alignItems: 'center',
              zIndex: 10,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{ color: '#713f12', fontWeight: '900', fontSize: 12 }}>
              ⭐ وفّر 50% — 6 أشهر مجاناً!
            </Text>
          </View>

          {/* "Most Popular" ribbon */}
          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: '#fbbf24',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
              zIndex: 10,
            }}
          >
            <Text style={{ color: '#0D0A2E', fontWeight: '800', fontSize: 11 }}>الأكثر طلباً</Text>
          </View>

          <View style={{ padding: 24, paddingTop: 60 }}>
            <Text style={{ color: '#c7d2fe', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
              الخطة السنوية
            </Text>

            {/* Price */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 }}>
              <Text style={{ color: '#ffffff', fontSize: 48, fontWeight: '900', lineHeight: 56 }}>
                $2.49
              </Text>
              <Text style={{ color: '#a5b4fc', fontSize: 15, marginRight: 4 }}>/شهرياً</Text>
            </View>
            <Text style={{ color: '#a5b4fc', fontSize: 13, marginBottom: 20 }}>
              (تُفوتر 29.99$ سنوياً)
            </Text>

            {/* Features */}
            <View style={{ marginBottom: 24 }}>
              {commonFeatures.map((f) => (
                <View key={f} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: '#fde68a', fontSize: 16, marginLeft: 10 }}>✓</Text>
                  <Text style={{ color: '#ffffff', fontSize: 15 }}>{f}</Text>
                </View>
              ))}
              {annualOnlyFeatures.map((f) => (
                <View key={f} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: '#fde68a', fontSize: 16, marginLeft: 10 }}>⚡</Text>
                  <Text style={{ color: '#fde68a', fontSize: 15, fontWeight: '700' }}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAnnual}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#facc15',
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                shadowColor: '#facc15',
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <Text style={{ color: '#0D0A2E', fontWeight: '900', fontSize: 16 }}>
                ابدأ الآن — وفّر 50% 🎉
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Monthly Plan Card (Decoy) ── */}
        <View
          className="bg-white rounded-2xl border border-gray-100 mb-4"
          style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, padding: 22 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#374151', fontSize: 16, fontWeight: '700' }}>الخطة الشهرية</Text>
            <View style={{ backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ color: '#6b7280', fontSize: 11, fontWeight: '600' }}>بدون إلتزام</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 }}>
            <Text style={{ color: '#8B5CF6', fontSize: 36, fontWeight: '900' }}>$4.99</Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginRight: 4 }}>/شهر</Text>
          </View>

          <View style={{ marginBottom: 18 }}>
            {commonFeatures.map((f) => (
              <View key={f} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: '#8B5CF6', fontSize: 15, marginLeft: 8 }}>✓</Text>
                <Text style={{ color: '#4b5563', fontSize: 14 }}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleMonthly}
            activeOpacity={0.8}
            style={{
              borderWidth: 1.5,
              borderColor: '#8B5CF6',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#8B5CF6', fontWeight: '700', fontSize: 15 }}>اشترك شهرياً</Text>
          </TouchableOpacity>
        </View>

        {/* Comparison callout */}
        <View
          style={{
            backgroundColor: '#f0fdf4',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#bbf7d0',
            padding: 14,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20, marginLeft: 10 }}>💡</Text>
          <Text style={{ color: '#15803d', fontSize: 13, fontWeight: '600', flex: 1 }}>
            الخطة السنوية توفّر لك{' '}
            <Text style={{ fontWeight: '900' }}>30.89$</Text> مقارنةً بالاشتراك شهرياً
          </Text>
        </View>

        {/* Footer note */}
        <Text className="text-center text-gray-400 text-xs mt-3">
          يمكنك إلغاء اشتراكك في أي وقت • بدون رسوم خفية
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
