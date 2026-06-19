import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, Radii } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'cyan' | 'purple' | 'gold' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, variant = 'cyan', disabled, style }: Props) {
  const bg = variant === 'cyan' ? Colors.cyan.DEFAULT
    : variant === 'purple' ? Colors.purple.DEFAULT
    : variant === 'gold' ? Colors.gold.DEFAULT
    : 'transparent';

  const textColor = variant === 'gold' ? Colors.dark.header
    : variant === 'outline' ? Colors.cyan.DEFAULT
    : Colors.text.onDark;

  const borderColor = variant === 'outline' ? Colors.cyan.DEFAULT : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[{
        backgroundColor: bg,
        borderRadius: Radii.lg,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: variant === 'outline' ? 1.5 : 0,
        borderColor,
        opacity: disabled ? 0.6 : 1,
      }, style]}
    >
      <Text style={{ color: textColor, fontWeight: '800', fontSize: 15 }}>{label}</Text>
    </TouchableOpacity>
  );
}
