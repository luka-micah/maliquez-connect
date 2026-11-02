import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { useColors } from '@/hooks/use-colors';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function Select({ label, value, options, onSelect, placeholder = 'Select an option' }: SelectProps) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <Pressable
        style={[styles.control, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={() => setOpen(true)}
      >
        <Text style={{ color: selected ? colors.text : colors.textSecondary }}>
          {selected ? selected.label : placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{label ?? 'Select'}</Text>
            <ScrollView>
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    style={[styles.option, active && { backgroundColor: colors.backgroundElement }]}
                    onPress={() => {
                      onSelect(o.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={{ color: colors.text }}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  control: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
  },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { maxHeight: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  option: { paddingVertical: 14, paddingHorizontal: 8, borderRadius: 10 },
});
