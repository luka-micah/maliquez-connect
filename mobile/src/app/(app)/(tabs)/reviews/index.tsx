import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { getListingReviews } from '@/api/reviews';
import { getMyListings } from '@/api/listings';
import { Screen } from '@/components/ui/screen';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';
import { useColors } from '@/hooks/use-colors';
import { formatDate } from '@/utils/format';
import { Spacing } from '@/constants/theme';
import type { Review } from '@/types';

interface ReviewWithListing extends Review {
  listingTitle: string;
}

export default function ReviewsScreen() {
  const colors = useColors();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['provider-reviews'],
    queryFn: async (): Promise<ReviewWithListing[]> => {
      const listings = await getMyListings({ limit: 100 });
      const groups = await Promise.all(
        listings.data.map(async (l) => {
          const reviews = await getListingReviews(l.id);
          return reviews.map((r) => ({ ...r, listingTitle: l.title }));
        }),
      );
      return groups
        .flat()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });

  const reviews = data ?? [];

  return (
    <Screen refreshing={isFetching} onRefresh={() => refetch()}>
      <Text style={[styles.title, { color: colors.text }]}>Customer Reviews</Text>

      {isLoading ? (
        <Spinner label="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Reviews from customers on your listings will appear here."
        />
      ) : (
        reviews.map((r) => (
          <Card key={r.id}>
            <View style={styles.row}>
              <Avatar
                name={r.user ? `${r.user.firstName} ${r.user.lastName}` : 'A'}
                size={44}
              />
              <View style={{ flex: 1, marginLeft: Spacing.three }}>
                <CardTitle>
                  {r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Anonymous'}
                </CardTitle>
                <CardBody>{r.listingTitle}</CardBody>
              </View>
              <StarRating rating={r.rating} size={16} />
            </View>
            {r.review ? (
              <Text style={[styles.text, { color: colors.text }]}>{r.review}</Text>
            ) : null}
            <View style={styles.footer}>
              <Badge label={`${r.helpfulCount} found helpful`} tone="neutral" />
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                {formatDate(r.createdAt)}
              </Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 14, marginTop: 10, lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  date: { fontSize: 12 },
});
