import { Pressable, StyleSheet, Text } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Brand, Radius } from '@/constants/theme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active, onPress }: ChipProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? Brand.main : colors.surface,
          borderColor: active ? Brand.main : colors.border,
          opacity: pressed ? 0.85 : 1,
          borderRadius: Radius.full,
        },
      ]}
    >
      <Text style={[styles.label, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
