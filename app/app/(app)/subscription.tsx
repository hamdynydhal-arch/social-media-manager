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

const annualFeatures = [...commonFeatures, 'أولوية في الدعم الفني'];

export default function SubscriptionScreen() {
  const handleMonthly = () => {
    if (MONTHLY_PAYMENT_URL) {
      Linking.openURL(MONTHLY_PAYMENT_URL);
    }
  };

  const handleAnnual = () => {
    if (ANNUAL_PAYMENT_URL) {
      Linking.openURL(ANNUAL_PAYMENT_URL);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ direction: 'rtl' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6 items-center">
          <Text className="text-2xl font-bold text-gray-800 mb-1">الخطة المجانية الحالية</Text>
          <Text className="text-gray-500 text-base text-center">
            قم بالترقية للوصول إلى جميع المميزات
          </Text>
        </View>

        {/* Monthly Plan Card */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-1">الخطة الشهرية</Text>
          <View className="flex-row items-baseline mb-4" style={{ flexDirection: 'row' }}>
            <Text className="text-4xl font-extrabold text-indigo-600">$2.99</Text>
            <Text className="text-gray-400 text-base mr-1">/شهر</Text>
          </View>

          <View className="mb-6">
            {commonFeatures.map((feature) => (
              <View
                key={feature}
                className="flex-row items-center mb-2"
                style={{ flexDirection: 'row' }}
              >
                <Text className="text-indigo-500 text-base ml-2">✓</Text>
                <Text className="text-gray-700 text-base">{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleMonthly}
            className="bg-indigo-600 rounded-xl py-3 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">اشترك الآن</Text>
          </TouchableOpacity>
        </View>

        {/* Annual Plan Card */}
        <View className="bg-gradient-to-br rounded-2xl shadow-md border border-purple-200 p-6 mb-4 overflow-hidden"
          style={{ backgroundColor: '#4f46e5' }}
        >
          {/* Save badge */}
          <View
            className="absolute top-4 left-4 bg-yellow-400 rounded-full px-3 py-1"
            style={{ position: 'absolute', top: 16, left: 16 }}
          >
            <Text className="text-yellow-900 font-bold text-xs">وفّر 16%</Text>
          </View>

          <Text className="text-lg font-bold text-white mb-1">الخطة السنوية</Text>
          <View className="flex-row items-baseline mb-4" style={{ flexDirection: 'row' }}>
            <Text className="text-4xl font-extrabold text-white">$29.99</Text>
            <Text className="text-indigo-200 text-base mr-1">/سنة</Text>
          </View>

          <View className="mb-6">
            {annualFeatures.map((feature) => (
              <View
                key={feature}
                className="flex-row items-center mb-2"
                style={{ flexDirection: 'row' }}
              >
                <Text className="text-yellow-300 text-base ml-2">✓</Text>
                <Text className="text-white text-base">{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleAnnual}
            className="bg-white rounded-xl py-3 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-indigo-600 font-bold text-base">اشترك الآن</Text>
          </TouchableOpacity>
        </View>

        {/* Footer note */}
        <Text className="text-center text-gray-400 text-sm mt-2">
          يمكنك إلغاء اشتراكك في أي وقت
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
