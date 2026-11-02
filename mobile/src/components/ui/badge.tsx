import { StyleSheet, Text } from 'react-native';

import { Brand } from '@/constants/theme';

type Tone = 'neutral' | 'green' | 'amber' | 'red' | 'brand';

const TONES: Record<Tone, { fg: string; bg: string }> = {
  neutral: { fg: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  green: { fg: '#1F9D55', bg: 'rgba(48,164,108,0.14)' },
  amber: { fg: '#B7791F', bg: 'rgba(245,166,35,0.16)' },
  red: { fg: '#D64550', bg: 'rgba(229,72,77,0.14)' },
  brand: { fg: Brand.main, bg: 'rgba(122,31,92,0.10)' },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const c = TONES[tone];
  return (
    <Text style={[styles.badge, { color: c.fg, backgroundColor: c.bg }]}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    letterSpacing: 0.2,
  },
});
