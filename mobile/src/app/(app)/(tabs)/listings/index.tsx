import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { getMyListings } from '@/api/listings';
import { Screen } from '@/components/ui/screen';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Chip } from '@/components/ui/chip';
import { StarRating } from '@/components/ui/star-rating';
import { useColors } from '@/hooks/use-colors';
import { SECTOR_LABELS, LISTING_STATUS_LABELS } from '@/constants/options';
import { formatCurrency } from '@/utils/format';
import { Spacing } from '@/constants/theme';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

function statusTone(status: string) {
  if (status === 'APPROVED') return 'green' as const;
  if (status === 'PENDING') return 'amber' as const;
  return 'red' as const;
}

export default function ListingsScreen() {
  const colors = useColors();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['my-listings', status],
    queryFn: () => getMyListings({ limit: 100, status: status || undefined }),
  });

  const listings = data?.data ?? [];

  return (
    <Screen refreshing={isFetching} onRefresh={() => refetch()}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>My Listings</Text>
        <Button
          title="New"
          onPress={() => router.push('/listings/new')}
          style={{ height: 42, paddingHorizontal: 18 }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            active={status === f.value}
            onPress={() => setStatus(f.value)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <Spinner label="Loading listings..." />
      ) : listings.length === 0 ? (
        <EmptyState
          title="No listings found"
          description={
            status
              ? `You have no ${status.toLowerCase()} listings.`
              : 'Create a listing to start getting discovered.'
          }
          action={<Button title="Create listing" onPress={() => router.push('/listings/new')} />}
        />
      ) : (
        listings.map((l) => (
          <TouchableOpacity key={l.id} onPress={() => router.push(`/listings/${l.id}`)}>
            <Card>
              <View style={styles.row}>
                <Avatar uri={l.images?.[0]} name={l.title} size={56} />
                <View style={{ flex: 1, marginLeft: Spacing.three }}>
                  <CardTitle>{l.title}</CardTitle>
                  <CardBody>
                    {SECTOR_LABELS[l.sector] ?? l.sector} · {l.category?.name ?? 'Uncategorized'}
                  </CardBody>
                  <View style={styles.meta}>
                    <StarRating rating={l.averageRating} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {l.reviewCount} reviews
                      {l.pricing?.minimum != null
                        ? ` · ${formatCurrency(l.pricing.minimum, l.pricing.currency)}`
                        : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.trailing}>
                  <Badge
                    label={LISTING_STATUS_LABELS[l.status] ?? l.status}
                    tone={statusTone(l.status)}
                  />
                  <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        onPress={() => queryClient.invalidateQueries({ queryKey: ['my-listings'] })}
      >
        <Text style={[styles.refresh, { color: colors.textSecondary }]}>Tap to refresh</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
  chips: { marginHorizontal: -24, paddingLeft: 24, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  trailing: { alignItems: 'flex-end', justifyContent: 'space-between', height: 56 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  metaText: { fontSize: 12 },
  chevron: { fontSize: 26, lineHeight: 28, fontWeight: '600' },
  refresh: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
