import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder – full implementation in Step 3
export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ direction: 'rtl' }} className="px-4 py-6">
        <Text className="text-2xl font-bold text-brand-900 text-right mb-2">
          لوحة التحكم
        </Text>
        <Text className="text-gray-500 text-right">
          مرحباً! ابدأ بإنشاء منشور جديد.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
