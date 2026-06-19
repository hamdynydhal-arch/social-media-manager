import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { usePWA } from '../lib/usePWA';

// Always rendered on web — never conditionally hidden by PWA state
export default function PWALoginButton() {
  if (Platform.OS !== 'web') return null;

  const pwa = usePWA();
  const [showModal, setShowModal] = useState(false);

  async function handlePress() {
    if (pwa.type === 'available') {
      try {
        const outcome = await pwa.prompt();
        if (outcome === 'dismissed') setShowModal(true);
        return;
      } catch {
        // fall through to instructions
      }
    }
    // iOS, unsupported, or prompt failed → show universal instructions
    setShowModal(true);
  }

  return (
    <View style={{ marginTop: 12, position: 'relative' }}>
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

      {/* Universal instructions overlay */}
      {showModal && (
        <View style={{
          position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 9999,
          backgroundColor: '#0C1040', borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: 'rgba(6,182,212,0.45)',
          shadowColor: '#06B6D4', shadowOpacity: 0.5, shadowRadius: 24, elevation: 30,
        }}>
          <TouchableOpacity
            onPress={() => setShowModal(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ position: 'absolute', top: 12, left: 14, zIndex: 1 }}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 20 }}>✕</Text>
          </TouchableOpacity>

          <Text style={{
            color: '#FFF', fontSize: 16, fontWeight: '800',
            textAlign: 'right', marginBottom: 16,
          }}>
            📲 كيف تثبّت التطبيق؟
          </Text>

          <Text style={{
            color: 'rgba(6,182,212,0.9)', fontSize: 13, fontWeight: '700',
            textAlign: 'right', marginBottom: 8,
          }}>
            على Android / Chrome:
          </Text>
          {[
            'افتح قائمة المتصفح (⋮) في أعلى اليمين',
            'اختر «إضافة إلى الشاشة الرئيسية»',
          ].map((t, i) => (
            <Text key={i} style={{ color: 'rgba(199,210,254,0.9)', fontSize: 13, textAlign: 'right', marginBottom: 6, lineHeight: 20 }}>
              {`${i + 1}. ${t}`}
            </Text>
          ))}

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 12 }} />

          <Text style={{
            color: 'rgba(6,182,212,0.9)', fontSize: 13, fontWeight: '700',
            textAlign: 'right', marginBottom: 8,
          }}>
            على iPhone / Safari:
          </Text>
          {[
            'افتح الصفحة في Safari',
            'اضغط زر المشاركة ﹕ في الأسفل',
            'اختر «إضافة إلى الشاشة الرئيسية»',
            'اضغط «إضافة»',
          ].map((t, i) => (
            <Text key={i} style={{ color: 'rgba(199,210,254,0.9)', fontSize: 13, textAlign: 'right', marginBottom: 6, lineHeight: 20 }}>
              {`${i + 1}. ${t}`}
            </Text>
          ))}

          <TouchableOpacity
            onPress={() => setShowModal(false)}
            style={{
              marginTop: 14, backgroundColor: 'rgba(6,182,212,0.15)',
              borderRadius: 12, paddingVertical: 10, alignItems: 'center',
              borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)',
            }}
          >
            <Text style={{ color: '#22D3EE', fontWeight: '700', fontSize: 14 }}>فهمت، شكراً!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
