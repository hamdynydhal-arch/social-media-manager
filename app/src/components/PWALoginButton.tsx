import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { usePWA } from '../lib/usePWA';

export default function PWALoginButton() {
  if (Platform.OS !== 'web') return null;

  const pwa = usePWA();
  const [showIos, setShowIos] = useState(false);

  if (pwa.type === 'installed' || pwa.type === 'unsupported') return null;

  return (
    <View style={{ marginTop: 12 }}>
      {/* Install button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (pwa.type === 'available') pwa.prompt();
          else if (pwa.type === 'ios') setShowIos(true);
        }}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#06B6D4', borderRadius: 16,
          paddingVertical: 14, paddingHorizontal: 20, gap: 8,
        }}
      >
        <Text style={{ fontSize: 18 }}>📲</Text>
        <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '800' }}>
          تثبيت التطبيق
        </Text>
      </TouchableOpacity>

      {/* iOS share-sheet overlay */}
      {showIos && (
        <View style={{
          position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 100,
          backgroundColor: '#0C1040', borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: 'rgba(6,182,212,0.4)',
          shadowColor: '#06B6D4', shadowOpacity: 0.4, shadowRadius: 24, elevation: 20,
        }}>
          <TouchableOpacity
            onPress={() => setShowIos(false)}
            style={{ position: 'absolute', top: 12, left: 14, zIndex: 1 }}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 20 }}>✕</Text>
          </TouchableOpacity>

          <Text style={{
            color: '#FFF', fontSize: 16, fontWeight: '800', textAlign: 'right', marginBottom: 14,
          }}>
            📲 تثبيت التطبيق على iPhone
          </Text>

          {[
            { n: '١', text: 'افتح هذه الصفحة في Safari' },
            { n: '٢', text: 'اضغط على زر المشاركة ﹕ في شريط أسفل الشاشة' },
            { n: '٣', text: 'اختر «إضافة إلى الشاشة الرئيسية»' },
            { n: '٤', text: 'اضغط «إضافة» لتثبيت التطبيق' },
          ].map(step => (
            <View key={step.n} style={{
              flexDirection: 'row', alignItems: 'flex-start',
              marginBottom: 10, gap: 10,
            }}>
              <View style={{
                width: 26, height: 26, borderRadius: 13,
                backgroundColor: 'rgba(6,182,212,0.2)',
                borderWidth: 1, borderColor: 'rgba(6,182,212,0.5)',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Text style={{ color: '#22D3EE', fontSize: 12, fontWeight: '800' }}>{step.n}</Text>
              </View>
              <Text style={{ color: 'rgba(199,210,254,0.9)', fontSize: 13, flex: 1, textAlign: 'right', lineHeight: 20 }}>
                {step.text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
