import { api } from '@/lib/api';
import type { ApiPaginated, Review } from '@/types';

export async function getListingReviews(listingId: string): Promise<Review[]> {
  const { data } = await api.get<ApiPaginated<Review>>(`/reviews/listing/${listingId}`);
  return data.data;
}
