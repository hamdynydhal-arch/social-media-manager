import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isWeb = Platform.OS === 'web';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{
      width: 40, height: 34, borderRadius: 12,
      backgroundColor: focused ? 'rgba(6,182,212,0.2)' : 'transparent',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  );
}

// Custom label rendered below each icon — bypasses React Navigation's
// internal Text container that clips Arabic descenders.
function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{
      fontSize: 10,
      fontWeight: '700',
      color: focused ? '#22D3EE' : '#9CA3AF',
      textAlign: 'center',
      lineHeight: 16,
      // overflow visible so Arabic descenders are never clipped
      overflow: 'visible',
      includeFontPadding: false,
      // extra bottom clearance for Arabic glyphs
      paddingBottom: 4,
    }}>
      {label}
    </Text>
  );
}

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  // Reserve enough space: icon (34) + label (16) + top pad (8) + safe area bottom
  const TAB_H = 34 + 16 + 10 + Math.max(insets.bottom, isWeb ? 10 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#07030F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(6,182,212,0.12)',
          height: TAB_H,
          paddingTop: 8,
          // Let safe-area govern the bottom — do NOT add extra paddingBottom
          // or the label gets pushed outside the container.
          paddingBottom: 0,
          shadowColor: '#06B6D4',
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 20,
        },
        // Disable the built-in label so we render our own via tabBarLabel
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* RTL order: rightmost tab (الإعدادات) declared first */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="الإعدادات" focused={focused} />,
          tabBarShowLabel: true,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💎" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="الاشتراك" focused={focused} />,
          tabBarShowLabel: true,
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 44, height: 40, borderRadius: 14,
              backgroundColor: focused ? '#0891B2' : '#0C0820',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#06B6D4', shadowOpacity: focused ? 0.7 : 0,
              shadowRadius: 12, elevation: focused ? 10 : 0,
            }}>
              <Text style={{ fontSize: 20 }}>✏️</Text>
            </View>
          ),
          tabBarLabel: ({ focused }) => <TabLabel label="نشر" focused={focused} />,
          tabBarShowLabel: true,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔗" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="الحسابات" focused={focused} />,
          tabBarShowLabel: true,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="الرئيسية" focused={focused} />,
          tabBarShowLabel: true,
        }}
      />
    </Tabs>
  );
}
