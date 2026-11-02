import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { TextField } from '@/components/ui/text-field';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImagePickerField } from '@/components/ui/image-picker-field';
import { useColors } from '@/hooks/use-colors';
import { SECTORS } from '@/constants/options';
import type { Category, Listing } from '@/types';

interface ListingFormProps {
  categories: Category[];
  initial?: Listing;
  submitting: boolean;
  onSubmit: (form: FormData) => void;
}

function toNum(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

const CURRENCIES = ['NGN', 'USD', 'EUR', 'GBP'];

export function ListingForm({ categories, initial, submitting, onSubmit }: ListingFormProps) {
  const colors = useColors();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [sector, setSector] = useState(initial?.sector ?? '');
  const [stateValue, setStateValue] = useState(initial?.location?.state ?? '');
  const [city, setCity] = useState(initial?.location?.city ?? '');
  const [address, setAddress] = useState(initial?.location?.address ?? '');
  const [phone, setPhone] = useState(initial?.contact?.phone ?? '');
  const [email, setEmail] = useState(initial?.contact?.email ?? '');
  const [website, setWebsite] = useState(initial?.contact?.website ?? '');
  const [priceMin, setPriceMin] = useState(
    initial?.pricing?.minimum != null ? String(initial.pricing.minimum) : '',
  );
  const [priceMax, setPriceMax] = useState(
    initial?.pricing?.maximum != null ? String(initial.pricing.maximum) : '',
  );
  const [currency, setCurrency] = useState(initial?.pricing?.currency ?? 'NGN');
  const [features, setFeatures] = useState((initial?.features ?? []).join(', '));
  const [newImages, setNewImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sectorOptions = SECTORS.map((s) => ({ label: s.label, value: s.value }));
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));
  const currencyOptions = CURRENCIES.map((c) => ({ label: c, value: c }));

  function handleSubmit() {
    if (!title.trim()) return setError('Title is required');
    if (!description.trim()) return setError('Description is required');
    if (!categoryId) return setError('Category is required');
    if (!sector) return setError('Sector is required');
    setError(null);

    const form = new FormData();
    form.append('title', title.trim());
    form.append('description', description.trim());
    form.append('category', categoryId);
    form.append('sector', sector);
    form.append(
      'location',
      JSON.stringify({ state: stateValue.trim(), city: city.trim(), address: address.trim() }),
    );
    form.append(
      'contact',
      JSON.stringify({ phone: phone.trim(), email: email.trim(), website: website.trim() }),
    );
    form.append(
      'pricing',
      JSON.stringify({ minimum: toNum(priceMin), maximum: toNum(priceMax), currency }),
    );
    form.append('features', features);
    newImages.forEach((uri, i) => {
      form.append('images', { uri, name: `image-${i}.jpg`, type: 'image/jpeg' } as any);
    });
    onSubmit(form);
  }

  return (
    <View style={styles.form}>
      {error ? <Text style={[styles.error, { color: '#E5484D' }]}>{error}</Text> : null}

      <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Bright Future Academy" />
      <TextField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your service"
        multiline
      />
      <Select
        label="Category"
        value={categoryId}
        options={categoryOptions}
        onSelect={setCategoryId}
        placeholder="Select category"
      />
      <Select
        label="Sector"
        value={sector}
        options={sectorOptions}
        onSelect={setSector}
        placeholder="Select sector"
      />

      <Text style={[styles.section, { color: colors.text }]}>Location</Text>
      <TextField label="State" value={stateValue} onChangeText={setStateValue} placeholder="e.g. Lagos" />
      <TextField label="City" value={city} onChangeText={setCity} placeholder="e.g. Ikeja" />
      <TextField label="Address" value={address} onChangeText={setAddress} placeholder="Street address" />

      <Text style={[styles.section, { color: colors.text }]}>Contact</Text>
      <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+234..." />
      <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="contact@example.com" />
      <TextField label="Website" value={website} onChangeText={setWebsite} keyboardType="url" placeholder="https://..." />

      <Text style={[styles.section, { color: colors.text }]}>Pricing</Text>
      <View style={styles.row}>
        <View style={styles.half}>
          <TextField label="Min" value={priceMin} onChangeText={setPriceMin} keyboardType="numeric" placeholder="0" />
        </View>
        <View style={styles.half}>
          <TextField label="Max" value={priceMax} onChangeText={setPriceMax} keyboardType="numeric" placeholder="0" />
        </View>
      </View>
      <Select label="Currency" value={currency} options={currencyOptions} onSelect={setCurrency} />

      <TextField
        label="Features (comma separated)"
        value={features}
        onChangeText={setFeatures}
        placeholder="Wifi, Parking, 24/7"
      />

      {initial?.images?.length ? (
        <View style={styles.wrap}>
          <Text style={[styles.section, { color: colors.text }]}>Current photos</Text>
          <View style={styles.grid}>
            {initial.images.map((uri, i) => (
              <Image key={`${uri}-${i}`} source={{ uri }} style={styles.existingThumb} />
            ))}
          </View>
        </View>
      ) : null}

      <ImagePickerField
        images={newImages}
        onAdd={(assets) => setNewImages((prev) => [...prev, ...assets.map((a) => a.uri)])}
        onRemove={(i) => setNewImages((prev) => prev.filter((_, idx) => idx !== i))}
      />

      <Button
        title={initial ? 'Save Changes' : 'Create Listing'}
        onPress={handleSubmit}
        loading={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 4 },
  error: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  section: { fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 2, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  wrap: { marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  existingThumb: { width: 72, height: 72, borderRadius: 10 },
});
