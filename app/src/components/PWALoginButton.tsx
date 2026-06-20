import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { usePWAContext } from '../contexts/PWAContext';

// Web-only. Shown on login screen only when Android/Chrome can install natively.
export default function PWALoginButton() {
  if (Platform.OS !== 'web') return null;

  const { isInstallable, triggerInstall } = usePWAContext();

  if (!isInstallable) return null;

  return (
    <View style={{ marginTop: 12 }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={triggerInstall}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#06B6D4', borderRadius: 16,
          paddingVertical: 14, paddingHorizontal: 20, gap: 8,
          shadowColor: '#06B6D4', shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
        }}
      >
        <Text style={{ fontSize: 18 }}>📲</Text>
        <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '800' }}>
          تثبيت التطبيق
        </Text>
      </TouchableOpacity>
    </View>
  );
}
