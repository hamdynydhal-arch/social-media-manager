import { View, Text, TouchableOpacity, Platform } from 'react-native';

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Web-only install button. On Android/Chrome: triggers native system prompt.
// On iOS: hidden (Apple blocks programmatic install — user must use Safari share sheet).
export default function PWALoginButton() {
  if (Platform.OS !== 'web') return null;
  if (isIos()) return null;

  async function handlePress() {
    const prompt: any =
      (window as any).deferredPrompt || (window as any).__pwaPrompt;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      (window as any).deferredPrompt = null;
      (window as any).__pwaPrompt = null;
    }
  }

  return (
    <View style={{ marginTop: 12 }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
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
