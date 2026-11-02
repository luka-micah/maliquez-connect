import { useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';

import {
  deleteListing,
  getCategories,
  getListing,
  updateListing,
} from '@/api/listings';
import { ListingForm } from '@/components/listing-form';
import { Screen } from '@/components/ui/screen';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { StarRating } from '@/components/ui/star-rating';
import { Chip } from '@/components/ui/chip';
import { useColors } from '@/hooks/use-colors';
import {
  LISTING_STATUS_LABELS,
  SECTOR_LABELS,
  VERIFICATION_LABELS,
} from '@/constants/options';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Listing } from '@/types';

function statusTone(status: string) {
  if (status === 'APPROVED') return 'green' as const;
  if (status === 'PENDING') return 'amber' as const;
  return 'red' as const;
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const listingQuery = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
    enabled: !!id,
  });

  const categories = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const updateMutation = useMutation({
    mutationFn: (form: FormData) => updateListing(id, form),
    onSuccess: (updated: Listing) => {
      queryClient.setQueryData(['listing', id], updated);
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      setEditing(false);
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      router.back();
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  function submitEdit(form: FormData) {
    setSubmitting(true);
    updateMutation.mutate(form, { onSettled: () => setSubmitting(false) });
  }

  function confirmDelete() {
    Alert.alert('Delete listing', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  }

  if (editing) {
    if (!listingQuery.data) {
      return (
        <Screen>
          <Spinner label="Loading..." />
        </Screen>
      );
    }
    return (
      <Screen>
        <ListingForm
          categories={categories.data ?? []}
          initial={listingQuery.data}
          submitting={submitting}
          onSubmit={submitEdit}
        />
        <Button title="Cancel" variant="secondary" onPress={() => setEditing(false)} />
      </Screen>
    );
  }

  if (listingQuery.isLoading || categories.isLoading) {
    return (
      <Screen>
        <Spinner label="Loading listing..." />
      </Screen>
    );
  }

  const listing = listingQuery.data;
  if (!listing) {
    return (
      <Screen>
        <Text style={{ color: colors.text }}>Listing not found.</Text>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        {listing.images && listing.images.length > 0 ? (
          <FlatList
            horizontal
            data={listing.images}
            keyExtractor={(uri) => uri}
            showsHorizontalScrollIndicator={false}
            style={styles.gallery}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.galleryImage} />
            )}
          />
        ) : null}

        <Card>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <CardTitle>{listing.title}</CardTitle>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>
                {SECTOR_LABELS[listing.sector] ?? listing.sector} ·{' '}
                {listing.category?.name ?? 'Uncategorized'}
              </Text>
            </View>
            <Badge
              label={LISTING_STATUS_LABELS[listing.status] ?? listing.status}
              tone={statusTone(listing.status)}
            />
          </View>
          <View style={styles.badgeRow}>
            <Badge
              label={VERIFICATION_LABELS[listing.verified] ?? listing.verified}
              tone={listing.verified === 'VERIFIED' ? 'green' : 'neutral'}
            />
            <View style={styles.ratingChip}>
              <StarRating rating={listing.averageRating} />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : '—'} (
                {listing.reviewCount})
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <CardTitle>Description</CardTitle>
          <CardBody>{listing.description}</CardBody>
        </Card>

        {listing.features && listing.features.length > 0 ? (
          <Card>
            <CardTitle>Features</CardTitle>
            <View style={styles.featureWrap}>
              {listing.features.map((f) => (
                <Chip key={f} label={f} active />
              ))}
            </View>
          </Card>
        ) : null}

        {listing.location ? (
          <Card>
            <CardTitle>Location</CardTitle>
            <CardBody>
              {[listing.location.address, listing.location.city, listing.location.state]
                .filter(Boolean)
                .join(', ')}
            </CardBody>
          </Card>
        ) : null}

        {listing.contact ? (
          <Card>
            <CardTitle>Contact</CardTitle>
            <CardBody>
              {[
                listing.contact.phone ? `Phone: ${listing.contact.phone}` : null,
                listing.contact.email ? `Email: ${listing.contact.email}` : null,
                listing.contact.website ? `Web: ${listing.contact.website}` : null,
              ]
                .filter(Boolean)
                .join('\n')}
            </CardBody>
          </Card>
        ) : null}

        {listing.pricing ? (
          <Card>
            <CardTitle>Pricing</CardTitle>
            <CardBody>
              {listing.pricing.minimum != null || listing.pricing.maximum != null
                ? `${formatCurrency(listing.pricing.minimum, listing.pricing.currency)} – ${formatCurrency(
                    listing.pricing.maximum,
                    listing.pricing.currency,
                  )}`
                : 'Contact for pricing'}
            </CardBody>
          </Card>
        ) : null}

        <Text style={[styles.created, { color: colors.textSecondary }]}>
          Created {formatDate(listing.createdAt)}
        </Text>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Button title="Edit" onPress={() => setEditing(true)} style={{ flex: 1 }} />
        <View style={{ width: 12 }} />
        <Button title="Delete" variant="danger" onPress={confirmDelete} style={{ flex: 1 }} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 14, paddingBottom: 24 },
  gallery: { marginHorizontal: -24, marginBottom: 6 },
  galleryImage: { width: 240, height: 160, marginRight: 12, borderRadius: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sub: { fontSize: 13, marginTop: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 13, fontWeight: '600' },
  featureWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  created: { fontSize: 12 },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
