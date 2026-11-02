import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';

export function Spinner({ label }: { label?: string }) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.textSecondary} />
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 32, alignItems: 'center', gap: 8 },
  label: { fontSize: 13 },
});
