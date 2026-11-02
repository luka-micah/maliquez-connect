import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useShadow, Brand } from '@/constants/theme';
import { Radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: ButtonProps) {
  const colors = useColors();
  const shadow = useShadow();
  const isDisabled = disabled || loading;

  const palette =
    variant === 'primary'
      ? { bg: Brand.main, fg: '#FFFFFF' }
      : variant === 'danger'
        ? { bg: '#E5484D', fg: '#FFFFFF' }
        : variant === 'secondary'
          ? { bg: 'transparent', fg: Brand.main }
          : { bg: 'transparent', fg: colors.text };

  const bordered = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
          borderWidth: bordered ? 1.5 : 0,
          borderColor: bordered ? Brand.main : 'transparent',
          borderRadius: Radius.md,
        },
        variant === 'primary' ? shadow : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <Text style={[styles.text, { color: palette.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
