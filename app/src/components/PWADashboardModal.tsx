import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { usePWAContext } from '../contexts/PWAContext';

// Web-only floating install button inside the app. Shown only when installable.
export default function PWADashboardModal() {
  if (Platform.OS !== 'web') return null;

  const { isInstallable, triggerInstall } = usePWAContext();

  if (!isInstallable) return null;

  return (
    <TouchableOpacity
      onPress={triggerInstall}
      activeOpacity={0.88}
      style={{
        position: 'absolute',
        bottom: 110, right: 16,
        backgroundColor: '#06B6D4',
        borderRadius: 28,
        paddingVertical: 12, paddingHorizontal: 18,
        flexDirection: 'row', alignItems: 'center', gap: 8,
        shadowColor: '#06B6D4', shadowOpacity: 0.55, shadowRadius: 20, elevation: 16,
        zIndex: 9999,
      }}
    >
      <Text style={{ fontSize: 18 }}>📲</Text>
      <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '800' }}>
        تثبيت
      </Text>
    </TouchableOpacity>
  );
}
