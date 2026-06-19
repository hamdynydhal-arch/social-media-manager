import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { usePWA } from '../lib/usePWA';
import { isDashboardPromptDismissed, dismissDashboardPrompt } from '../lib/pwa';

export default function PWADashboardModal() {
  if (Platform.OS !== 'web') return null;

  const pwa = usePWA();
  const [dismissed, setDismissed] = useState(() => isDashboardPromptDismissed());
  const [showIos, setShowIos] = useState(false);

  if (dismissed) return null;
  if (pwa.type === 'installed' || pwa.type === 'unsupported') return null;

  function dismiss() {
    dismissDashboardPrompt();
    setDismissed(true);
  }

  return (
    <View style={{
      position: 'absolute',
      bottom: 100, left: 16, right: 16,
      backgroundColor: '#0C1040',
      borderRadius: 22,
      padding: 20,
      borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)',
      shadowColor: '#06B6D4', shadowOpacity: 0.45, shadowRadius: 30, elevation: 24,
      zIndex: 999,
    }}>
      {/* Dismiss */}
      <TouchableOpacity
        onPress={dismiss}
        style={{ position: 'absolute', top: 12, left: 14 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={{ color: '#6B7280', fontSize: 18 }}>✕</Text>
      </TouchableOpacity>

      {/* Glow orb */}
      <View style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: 40, backgroundColor: 'rgba(6,182,212,0.15)',
      }} />

      {!showIos ? (
        <>
          <Text style={{
            color: 'rgba(103,232,249,0.8)', fontSize: 12, fontWeight: '700',
            textAlign: 'right', marginBottom: 4, letterSpacing: 0.6,
          }}>
            تجربة أفضل
          </Text>
          <Text style={{
            color: '#FFF', fontSize: 17, fontWeight: '900', textAlign: 'right', marginBottom: 6,
          }}>
            ثبّت التطبيق على جهازك 📲
          </Text>
          <Text style={{
            color: 'rgba(199,210,254,0.75)', fontSize: 13, textAlign: 'right',
            lineHeight: 19, marginBottom: 18,
          }}>
            استخدمه بدون متصفح — وصول أسرع ومباشر من شاشتك الرئيسية.
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
              onPress={() => {
                if (pwa.type === 'available') { pwa.prompt(); dismiss(); }
                else if (pwa.type === 'ios') setShowIos(true);
              }}
              activeOpacity={0.85}
              style={{
                flex: 2, backgroundColor: '#06B6D4', borderRadius: 14,
                paddingVertical: 12, alignItems: 'center',
                shadowColor: '#06B6D4', shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '800' }}>تثبيت التطبيق</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={{
            color: '#FFF', fontSize: 16, fontWeight: '800', textAlign: 'right', marginBottom: 14,
          }}>
            📲 تثبيت على iPhone
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
          <TouchableOpacity onPress={dismiss} style={{ marginTop: 8, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280', fontSize: 13 }}>إغلاق</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
