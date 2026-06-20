import { View, Text, Image } from 'react-native';
import { Colors, Radii } from '../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
}

export function GradientHeader({ title, subtitle }: Props) {
  return (
    <View style={{
      backgroundColor: Colors.dark.header,
      paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36,
      borderBottomLeftRadius: Radii.header, borderBottomRightRadius: Radii.header,
      marginBottom: -18, overflow: 'hidden',
    }}>
      {/* Cyan glow orb top-left */}
      <View style={{
        position: 'absolute', top: -30, left: -30, width: 140, height: 140,
        borderRadius: 70, backgroundColor: Colors.cyan.glow,
      }} />
      {/* Purple glow orb bottom-right */}
      <View style={{
        position: 'absolute', bottom: -20, right: -20, width: 100, height: 100,
        borderRadius: 50, backgroundColor: Colors.purple.glow,
      }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
        <View style={{ flex: 1 }}>
          {subtitle && (
            <Text style={{ color: Colors.text.onDarkSub, fontSize: 13, textAlign: 'right' }}>
              {subtitle}
            </Text>
          )}
          <Text style={{ color: Colors.text.onDark, fontSize: 24, fontWeight: '900', textAlign: 'right' }}>
            {title}
          </Text>
        </View>
        <Image
          source={require('../../assets/logo.jpg')}
          style={{ width: 42, height: 42, borderRadius: 12 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
