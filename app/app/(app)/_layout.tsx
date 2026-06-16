import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { direction: 'rtl' },
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'لوحة التحكم',
          tabBarIcon: () => <Text className="text-xl">🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: 'منشور جديد',
          tabBarIcon: () => <Text className="text-xl">✏️</Text>,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'الحسابات',
          tabBarIcon: () => <Text className="text-xl">🔗</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: () => <Text className="text-xl">⚙️</Text>,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'الاشتراك',
          tabBarIcon: () => <Text className="text-xl">💎</Text>,
        }}
      />
    </Tabs>
  );
}
