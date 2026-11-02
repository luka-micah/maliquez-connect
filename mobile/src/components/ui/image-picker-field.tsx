import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useColors } from '@/hooks/use-colors';

interface ImagePickerFieldProps {
  images: string[];
  onAdd: (assets: { uri: string }[]) => void;
  onRemove: (index: number) => void;
}

export function ImagePickerField({ images, onAdd, onRemove }: ImagePickerFieldProps) {
  const colors = useColors();

  async function pick() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length,
    });
    if (!result.canceled) {
      onAdd(result.assets.map((a) => ({ uri: a.uri })));
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Photos (up to 10)</Text>
      <View style={styles.grid}>
        {images.map((uri, i) => (
          <View key={`${uri}-${i}`} style={styles.thumb}>
            <Image source={{ uri }} style={styles.image} />
            <Pressable style={styles.remove} onPress={() => onRemove(i)}>
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </View>
        ))}
        {images.length < 10 ? (
          <Pressable
            style={[styles.add, { borderColor: colors.textSecondary }]}
            onPress={pick}
          >
            <Text style={[styles.addText, { color: colors.textSecondary }]}>+ Add</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumb: { width: 84, height: 84, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 16, lineHeight: 18 },
  add: {
    width: 84,
    height: 84,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontSize: 13, fontWeight: '600' },
});
