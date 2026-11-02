import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useColors } from '@/hooks/use-colors';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 40, alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '700' },
  description: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  action: { marginTop: 12 },
});
