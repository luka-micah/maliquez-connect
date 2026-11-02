import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';

export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const colors = useColors();
  const full = Math.round(rating);
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[
            { fontSize: size, color: i <= full ? '#F5A623' : colors.textSecondary, marginRight: 1 },
          ]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
