import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useShadow, Radius, Brand } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  const colors = useColors();
  const shadow = useShadow();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: accent ? Brand.main : colors.surface,
          borderColor: colors.border,
          borderRadius: Radius.lg,
        },
        shadow,
      ]}
    >
      <Text style={[styles.value, { color: accent ? '#FFFFFF' : colors.text }]}>
        {value}
      </Text>
      <Text
        style={[
          styles.label,
          { color: accent ? 'rgba(255,255,255,0.85)' : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    padding: 18,
    borderWidth: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
});
