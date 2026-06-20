import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { usePWA } from '../lib/usePWA';

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios|chrome/i.test(ua);
}

// Always rendered on web — button is always visible
export default function PWALoginButton() {
  if (Platform.OS !== 'web') return null;

  const pwa = usePWA();
  const [showIosModal, setShowIosModal] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  async function handlePress() {
    if (isIosSafari()) {
      // iOS Safari: always show share-sheet instructions
      setShowIosModal(true);
      return;
    }

    // Android / Chrome / Desktop: try native prompt
    if (pwa.type === 'available') {
      try {
        await pwa.prompt();
        return;
      } catch {
        // prompt threw — show minimal fallback
      }
    }

    // beforeinstallprompt not yet fired or failed: show Android instructions
    setShowFallback(true);
  }

  const showModal = showIosModal || showFallback;

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

      {showModal && (
        <View style={{
          position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 9999,
          backgroundColor: '#0C1040', borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: 'rgba(6,182,212,0.45)',
          shadowColor: '#06B6D4', shadowOpacity: 0.5, shadowRadius: 24, elevation: 30,
        }}>
          <TouchableOpacity
            onPress={() => { setShowIosModal(false); setShowFallback(false); }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ position: 'absolute', top: 12, left: 14, zIndex: 1 }}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 20 }}>✕</Text>
          </TouchableOpacity>

          <Text style={{
            color: '#FFF', fontSize: 16, fontWeight: '800',
            textAlign: 'right', marginBottom: 16,
          }}>
            {showIosModal ? '📲 تثبيت على iPhone' : '📲 تثبيت التطبيق'}
          </Text>

          {showIosModal ? (
            // iOS Safari steps
            [
              'افتح هذه الصفحة في Safari',
              'اضغط على زر المشاركة ﹕ في شريط أسفل الشاشة',
              'اختر «إضافة إلى الشاشة الرئيسية»',
              'اضغط «إضافة» لتثبيت التطبيق',
            ].map((text, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
                <View style={{
                  width: 26, height: 26, borderRadius: 13,
                  backgroundColor: 'rgba(6,182,212,0.2)',
                  borderWidth: 1, borderColor: 'rgba(6,182,212,0.5)',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Text style={{ color: '#22D3EE', fontSize: 11, fontWeight: '800' }}>
                    {['١','٢','٣','٤'][i]}
                  </Text>
                </View>
                <Text style={{ color: 'rgba(199,210,254,0.9)', fontSize: 13, flex: 1, textAlign: 'right', lineHeight: 20 }}>
                  {text}
                </Text>
              </View>
            ))
          ) : (
            // Android / Chrome fallback (prompt not yet available)
            <>
              <Text style={{ color: 'rgba(199,210,254,0.75)', fontSize: 13, textAlign: 'right', marginBottom: 12, lineHeight: 19 }}>
                افتح قائمة المتصفح وثبّت التطبيق مباشرة:
              </Text>
              {[
                'اضغط على قائمة المتصفح (⋮) في أعلى اليمين',
                'اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»',
              ].map((text, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
                  <View style={{
                    width: 26, height: 26, borderRadius: 13,
                    backgroundColor: 'rgba(6,182,212,0.2)',
                    borderWidth: 1, borderColor: 'rgba(6,182,212,0.5)',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Text style={{ color: '#22D3EE', fontSize: 11, fontWeight: '800' }}>
                      {['١','٢'][i]}
                    </Text>
                  </View>
                  <Text style={{ color: 'rgba(199,210,254,0.9)', fontSize: 13, flex: 1, textAlign: 'right', lineHeight: 20 }}>
                    {text}
                  </Text>
                </View>
              ))}
            </>
          )}

          <TouchableOpacity
            onPress={() => { setShowIosModal(false); setShowFallback(false); }}
            style={{
              marginTop: 10, backgroundColor: 'rgba(6,182,212,0.15)',
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
