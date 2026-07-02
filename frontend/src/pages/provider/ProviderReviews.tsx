import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { listingApi, reviewApi } from '../../api/authApi';
import ReviewCard from '../../components/common/ReviewCard';
import { FiStar, FiMessageSquare } from 'react-icons/fi';
import { ApiResponse, Listing, Review } from '../../types';

interface ReviewWithListing extends Review {
  listingTitle?: string;
  listingId?: string;
}

const ProviderReviews = () => {
  const { data: listingsRes, isLoading: listingsLoading, error: listingsError } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingApi.getMine(),
  });

  const listings: Listing[] = listingsRes?.data?.data || [];
  const listingIds: string[] = listings.map((l: Listing) => l.id);

  const { data: allReviewsRes, isLoading: reviewsLoading, error: reviewsError } = useQuery({
    queryKey: ['provider-reviews', listingIds],
    queryFn: async () => {
      const results = await Promise.allSettled(
        listingIds.map((id: string) => reviewApi.getListingReviews(id)),
      );
      const reviews: ReviewWithListing[] = [];
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          const axiosRes = result.value as AxiosResponse<ApiResponse<Review[]>>;
          const listingReviews: Review[] = axiosRes?.data?.data || [];
          const reviewArr = Array.isArray(listingReviews) ? listingReviews : [];
          reviews.push(
            ...reviewArr.map((r: Review) => ({
              ...r,
              listingTitle: listings[idx]?.title || 'Unknown Listing',
              listingId: listingIds[idx],
            })),
          );
        }
      });
      return reviews.sort((a: ReviewWithListing, b: ReviewWithListing) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: listingIds.length > 0,
  });

  const reviews: ReviewWithListing[] = allReviewsRes || [];
  const isLoading = listingsLoading || (listingIds.length > 0 && reviewsLoading);
  const error = listingsError || reviewsError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load reviews. Please try again.</p>
      </div>
    );
  }

  const totalReviews = listings.reduce((sum: number, l: Listing) => sum + (l.reviewCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">{totalReviews} total reviews across {listings.length} listings</p>
        </div>
      </div>

      {listings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-500">Create listings to start receiving reviews.</p>
        </div>
      )}

      {listings.length > 0 && reviews.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500">Reviews from customers will appear here.</p>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review: ReviewWithListing) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {review.listingTitle && (
                <div className="px-4 pt-4 pb-0">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    {review.listingTitle}
                  </span>
                </div>
              )}
              <ReviewCard
                review={review}
                onHelpful={(id: string) => reviewApi.markHelpful(id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderReviews;
