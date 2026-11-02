import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';

interface ScreenProps {
  children: ReactNode;
  insets?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function Screen({ children, insets = true, refreshing, onRefresh }: ScreenProps) {
  const colors = useColors();
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={insets ? ['top', 'left', 'right'] : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
});
