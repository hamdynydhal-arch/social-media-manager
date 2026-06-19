import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { usePWA } from '../lib/usePWA';
import { isDashboardPromptDismissed, dismissDashboardPrompt } from '../lib/pwa';

// Always rendered on web (unless dismissed) — never hidden by PWA state
export default function PWADashboardModal() {
  if (Platform.OS !== 'web') return null;

  const pwa = usePWA();
  const [dismissed, setDismissed] = useState(() => isDashboardPromptDismissed());
  const [showInstructions, setShowInstructions] = useState(false);

  if (dismissed) return null;

  function dismiss() {
    dismissDashboardPrompt();
    setDismissed(true);
  }

  async function handleInstall() {
    if (pwa.type === 'available') {
      try {
        await pwa.prompt();
        dismiss();
        return;
      } catch {
        // fall through
      }
    }
    setShowInstructions(true);
  }

  return (
    <View style={{
      position: 'absolute',
      bottom: 100, left: 16, right: 16,
      backgroundColor: '#0C1040',
      borderRadius: 22, padding: 20,
      borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)',
      shadowColor: '#06B6D4', shadowOpacity: 0.5, shadowRadius: 30, elevation: 24,
      zIndex: 9999,
    }}>
      {/* Dismiss X */}
      <TouchableOpacity
        onPress={dismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{ position: 'absolute', top: 12, left: 14 }}
      >
        <Text style={{ color: '#6B7280', fontSize: 18 }}>✕</Text>
      </TouchableOpacity>

      {/* Glow orb */}
      <View style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: 40, backgroundColor: 'rgba(6,182,212,0.15)',
        pointerEvents: 'none',
      } as any} />

      {!showInstructions ? (
        <>
          <Text style={{
            color: 'rgba(103,232,249,0.8)', fontSize: 12, fontWeight: '700',
            textAlign: 'right', marginBottom: 4, letterSpacing: 0.6,
          }}>
            تجربة أفضل
          </Text>
          <Text style={{
            color: '#FFF', fontSize: 17, fontWeight: '900',
            textAlign: 'right', marginBottom: 6,
          }}>
            ثبّت التطبيق على جهازك 📲
          </Text>
          <Text style={{
            color: 'rgba(199,210,254,0.75)', fontSize: 13,
            textAlign: 'right', lineHeight: 19, marginBottom: 18,
          }}>
            وصول أسرع مباشر من شاشتك الرئيسية — بدون متصفح.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={dismiss}
              activeOpacity={0.75}
              style={{
                flex: 1, borderRadius: 14, paddingVertical: 12,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600' }}>لاحقاً</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleInstall}
              activeOpacity={0.85}
              style={{
                flex: 2, backgroundColor: '#06B6D4', borderRadius: 14,
                paddingVertical: 12, alignItems: 'center',
                shadowColor: '#06B6D4', shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '800' }}>تثبيت الآن</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={{
            color: '#FFF', fontSize: 15, fontWeight: '800',
            textAlign: 'right', marginBottom: 14,
          }}>
            📲 كيف تثبّت التطبيق؟
          </Text>

          <Text style={{
            color: 'rgba(6,182,212,0.9)', fontSize: 12, fontWeight: '700',
            textAlign: 'right', marginBottom: 6,
          }}>Android / Chrome:</Text>
          {['افتح قائمة المتصفح (⋮)', 'اختر «إضافة إلى الشاشة الرئيسية»'].map((t, i) => (
            <Text key={i} style={{ color: 'rgba(199,210,254,0.85)', fontSize: 13, textAlign: 'right', marginBottom: 5, lineHeight: 19 }}>
              {`${i + 1}. ${t}`}
            </Text>
          ))}

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 }} />

          <Text style={{
            color: 'rgba(6,182,212,0.9)', fontSize: 12, fontWeight: '700',
            textAlign: 'right', marginBottom: 6,
          }}>iPhone / Safari:</Text>
          {[
            'افتح في Safari',
            'اضغط زر المشاركة ﹕',
            'اختر «إضافة إلى الشاشة الرئيسية»',
            'اضغط «إضافة»',
          ].map((t, i) => (
            <Text key={i} style={{ color: 'rgba(199,210,254,0.85)', fontSize: 13, textAlign: 'right', marginBottom: 5, lineHeight: 19 }}>
              {`${i + 1}. ${t}`}
            </Text>
          ))}

          <TouchableOpacity
            onPress={dismiss}
            style={{
              marginTop: 14, backgroundColor: 'rgba(6,182,212,0.15)',
              borderRadius: 12, paddingVertical: 10, alignItems: 'center',
              borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)',
            }}
          >
            <Text style={{ color: '#22D3EE', fontWeight: '700' }}>فهمت، شكراً!</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
