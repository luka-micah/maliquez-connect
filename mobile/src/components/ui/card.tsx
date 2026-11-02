import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useColors } from '@/hooks/use-colors';
import { useShadow } from '@/constants/theme';
import { Radius } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  style?: any;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  const colors = useColors();
  const shadow = useShadow();
  const Container = onPress ? Pressable : View;
  return (
    <Container
      {...(onPress ? { onPress } : {})}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: Radius.lg,
        },
        shadow,
        style,
      ]}
    >
      {children}
    </Container>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  const colors = useColors();
  return <Text style={[styles.title, { color: colors.text }]}>{children}</Text>;
}

export function CardBody({ children }: { children: ReactNode }) {
  const colors = useColors();
  return <Text style={[styles.body, { color: colors.textSecondary }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  body: { fontSize: 14, lineHeight: 20 },
});
