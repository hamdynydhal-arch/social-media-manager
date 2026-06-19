import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';

const isWeb = Platform.OS === 'web';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{
      width: 40, height: 32, borderRadius: 12,
      backgroundColor: focused ? 'rgba(103,232,249,0.2)' : 'transparent',
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 2,
    }}>
      <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0A2E',
          borderTopWidth: 0,
          height: isWeb ? 58 : 70,
          paddingTop: 4,
          paddingBottom: isWeb ? 8 : 14,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 20,
        },
        tabBarActiveTintColor: '#67E8F9',
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: 'نشر',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 44, height: 40, borderRadius: 14,
              backgroundColor: focused ? '#8B5CF6' : '#1E1040',
              alignItems: 'center', justifyContent: 'center', marginBottom: 4,
              shadowColor: '#8B5CF6', shadowOpacity: focused ? 0.6 : 0, shadowRadius: 10, elevation: focused ? 8 : 0,
            }}>
              <Text style={{ fontSize: 20 }}>✏️</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'الحسابات',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔗" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'الاشتراك',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
