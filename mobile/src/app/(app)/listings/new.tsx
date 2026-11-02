import { useState } from 'react';
import { Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { getCategories, createListing } from '@/api/listings';
import { ListingForm } from '@/components/listing-form';
import { Screen } from '@/components/ui/screen';
import { Spinner } from '@/components/ui/spinner';

export default function NewListingScreen() {
  const categories = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(form: FormData) {
    setSubmitting(true);
    try {
      await createListing(form);
      router.replace('/listings');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (categories.isLoading) {
    return (
      <Screen>
        <Spinner label="Loading categories..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ListingForm
        categories={categories.data ?? []}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}
