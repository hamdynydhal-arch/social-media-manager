import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';

const isWeb = Platform.OS === 'web';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{
      width: 40, height: 32, borderRadius: 12,
      backgroundColor: focused ? 'rgba(6,182,212,0.2)' : 'transparent',
      alignItems: 'center', justifyContent: 'center',
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
          backgroundColor: '#07030F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(6,182,212,0.12)',
          height: isWeb ? 64 : 80,
          paddingTop: 8,
          paddingBottom: isWeb ? 12 : 20,
          shadowColor: '#06B6D4',
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 20,
        },
        tabBarActiveTintColor: '#22D3EE',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* RTL order: rightmost tab declared first */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
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
        name="new-post"
        options={{
          title: 'نشر',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 44, height: 40, borderRadius: 14,
              backgroundColor: focused ? '#0891B2' : '#0C0820',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#06B6D4', shadowOpacity: focused ? 0.7 : 0, shadowRadius: 12, elevation: focused ? 10 : 0,
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
        name="dashboard"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
