import { View, ViewStyle } from 'react-native';
import { Colors, Radii, Shadows } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'faint';
}

export function BrandCard({ children, style, variant = 'default' }: Props) {
  return (
    <View style={[{
      backgroundColor: Colors.surface,
      borderRadius: Radii.card,
      padding: 20,
      borderWidth: 1,
      borderColor: variant === 'faint' ? Colors.surfaceFaint : Colors.surfaceFaint,
      ...Shadows.card,
    }, style]}>
      {children}
    </View>
  );
}
