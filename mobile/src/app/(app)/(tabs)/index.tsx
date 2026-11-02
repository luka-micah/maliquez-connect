import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { getMyListings } from '@/api/listings';
import { Screen } from '@/components/ui/screen';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { StatCard } from '@/components/ui/stat-card';
import { StarRating } from '@/components/ui/star-rating';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/store/auth';
import { SECTOR_LABELS, LISTING_STATUS_LABELS } from '@/constants/options';
import { formatCurrency } from '@/utils/format';
import { Spacing } from '@/constants/theme';

function statusTone(status: string) {
  if (status === 'APPROVED') return 'green' as const;
  if (status === 'PENDING') return 'amber' as const;
  return 'red' as const;
}

export default function DashboardScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['my-listings', 'all'],
    queryFn: () => getMyListings({ limit: 100 }),
  });

  if (isLoading) {
    return (
      <Screen>
        <Spinner label="Loading dashboard..." />
      </Screen>
    );
  }

  const listings = data?.data ?? [];
  const total = listings.length;
  const approved = listings.filter((l) => l.status === 'APPROVED').length;
  const pending = listings.filter((l) => l.status === 'PENDING').length;
  const totalReviews = listings.reduce((sum, l) => sum + l.reviewCount, 0);
  const rated = listings.filter((l) => l.averageRating > 0);
  const avg =
    rated.length > 0
      ? Math.round((rated.reduce((s, l) => s + l.averageRating, 0) / rated.length) * 10) / 10
      : 0;
  const recent = listings.slice(0, 5);

  return (
    <Screen refreshing={isFetching} onRefresh={() => refetch()}>
      <View style={styles.greetingRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back</Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
        </View>
        <Avatar name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} size={48} />
      </View>

      <View style={styles.statGrid}>
        <StatCard label="Listings" value={total} />
        <StatCard label="Approved" value={approved} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Reviews" value={totalReviews} accent />
      </View>

      <Card>
        <View style={styles.ratingRow}>
          <Text style={[styles.ratingValue, { color: colors.text }]}>
            {avg > 0 ? avg.toFixed(1) : '—'}
          </Text>
          <View>
            <StarRating rating={avg} size={18} />
            <Text style={[styles.ratingMeta, { color: colors.textSecondary }]}>
              {rated.length} rated {rated.length === 1 ? 'listing' : 'listings'}
            </Text>
          </View>
        </View>
      </Card>

      <Button title="Add Listing" onPress={() => router.push('/listings/new')} />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent listings</Text>
      {recent.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Create your first listing to get discovered by customers."
          action={<Button title="Create listing" onPress={() => router.push('/listings/new')} />}
        />
      ) : (
        recent.map((l) => (
          <TouchableOpacity key={l.id} onPress={() => router.push(`/listings/${l.id}`)}>
            <Card>
              <View style={styles.listRow}>
                <Avatar uri={l.images?.[0]} name={l.title} size={48} />
                <View style={{ flex: 1, marginLeft: Spacing.three }}>
                  <CardTitle>{l.title}</CardTitle>
                  <CardBody>
                    {SECTOR_LABELS[l.sector] ?? l.sector} · {l.category?.name ?? 'Uncategorized'}
                  </CardBody>
                </View>
                <Badge label={LISTING_STATUS_LABELS[l.status] ?? l.status} tone={statusTone(l.status)} />
              </View>
              <View style={styles.listMeta}>
                <StarRating rating={l.averageRating} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {l.reviewCount} reviews
                  {l.pricing?.minimum != null
                    ? ` · from ${formatCurrency(l.pricing.minimum, l.pricing.currency)}`
                    : ''}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity onPress={() => queryClient.invalidateQueries({ queryKey: ['my-listings'] })}>
        <Text style={[styles.refresh, { color: colors.textSecondary }]}>Tap to refresh</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 14 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ratingValue: { fontSize: 36, fontWeight: '800' },
  ratingMeta: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 8 },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  metaText: { fontSize: 12 },
  refresh: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
