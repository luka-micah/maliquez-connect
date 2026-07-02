import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { AxiosResponse } from 'axios';
import { listingApi, reviewApi, favoriteApi } from '../../api/authApi';
import StarRating from '../../components/common/StarRating';
import ReviewCard from '../../components/common/ReviewCard';
import {
  FiStar, FiMapPin, FiPhone, FiMail, FiGlobe, FiClock, FiCheck,
  FiPlus, FiHeart, FiArrowLeft, FiShare2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, Listing, Review } from '../../types';

interface RootState {
  auth: {
    isAuthenticated: boolean;
  };
}

interface ReviewsQueryResult {
  reviews?: Review[];
}

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<string>('reviews');
  const [compared, setCompared] = useState<boolean>(false);

  const { data: listingRes, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingApi.getById(id!),
    enabled: !!id,
  });

  const { data: reviewsRes, isLoading: reviewsLoading } = useQuery({
    queryKey: ['listing-reviews', id],
    queryFn: () => reviewApi.getListingReviews(id!),
    enabled: !!id && activeTab === 'reviews',
  });

  useEffect(() => {
    if (id) {
      const stored: string[] = JSON.parse(localStorage.getItem('compareIds') || '[]');
      setCompared(stored.includes(id));
    }
  }, [id]);

  const listing: Listing | undefined = listingRes?.data?.data;
  const reviews: Review[] = reviewsRes?.data?.data || [];
  const heroImage: string = listing?.images?.[0] || 'https://via.placeholder.com/1200x500?text=No+Image';

  const handleAddToCompare = () => {
    if (!id) return;
    const stored: string[] = JSON.parse(localStorage.getItem('compareIds') || '[]');
    if (stored.includes(id)) {
      toast('Already in comparison list');
      return;
    }
    if (stored.length >= 5) {
      toast.error('Maximum 5 listings can be compared at once');
      return;
    }
    stored.push(id);
    localStorage.setItem('compareIds', JSON.stringify(stored));
    setCompared(true);
    toast.success('Added to comparison');
  };

  const addFavoriteMutation = useMutation<any, any, void>({
    mutationFn: () => favoriteApi.add(id!),
    onSuccess: () => toast.success('Added to favorites'),
    onError: () => toast.error('Failed to add to favorites'),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-[400px] bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
        <p className="text-gray-500 mb-6">The listing you are looking for does not exist or has been removed.</p>
        <Link to="/search" className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-2">
          <FiArrowLeft className="w-4 h-4" /> Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/search" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6">
        <FiArrowLeft className="w-4 h-4" /> Back to search
      </Link>

      <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden mb-8">
        <img src={heroImage} alt={listing.title} className="w-full h-full object-cover" />
        {listing.verified === 'VERIFIED' && (
          <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <FiCheck className="w-4 h-4" /> Verified
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {listing.sector}
              </span>
              {listing.category && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {typeof listing.category === 'object' ? listing.category.name : listing.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-semibold">{listing.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-gray-400 text-sm">({listing.reviewCount || 0} reviews)</span>
              </div>
            </div>
          </div>

          {listing.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {listing.features?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Features</h2>
              <div className="flex flex-wrap gap-2">
                {listing.features.map((f: string, i: number) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200">
                    <FiCheck className="w-3.5 h-3.5 text-green-500" /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="flex gap-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({listing.reviewCount || 0})
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Details
              </button>
            </div>

            <div className="py-6">
              {activeTab === 'reviews' && (
                <>
                  {reviewsLoading && (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse card p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-24" />
                              <div className="h-3 bg-gray-200 rounded w-16" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!reviewsLoading && reviews.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                  )}
                  {!reviewsLoading && reviews.length > 0 && (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  {listing.sector && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiGlobe className="w-5 h-5 text-gray-400" />
                      <span>Sector: <strong>{listing.sector}</strong></span>
                    </div>
                  )}
                  {listing.category && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiStar className="w-5 h-5 text-gray-400" />
                      <span>Category: <strong>{typeof listing.category === 'object' ? listing.category.name : listing.category}</strong></span>
                    </div>
                  )}
                  {listing.verified && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span>Status: <strong className="text-green-600">{listing.verified}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            {listing.pricing?.minimum && (
              <div>
                <p className="text-sm text-gray-500">Starting from</p>
                <p className="text-2xl font-bold text-primary-600">
                  {listing.pricing.currency || '$'} {listing.pricing.minimum.toLocaleString()}
                  {listing.pricing.maximum && (
                    <span className="text-lg text-gray-400 font-normal">
                      {' '}- {listing.pricing.currency || '$'} {listing.pricing.maximum.toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-3">
              {listing.contact?.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${listing.contact.phone}`} className="hover:text-primary-600">{listing.contact.phone}</a>
                </div>
              )}
              {listing.contact?.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${listing.contact.email}`} className="hover:text-primary-600">{listing.contact.email}</a>
                </div>
              )}
              {listing.contact?.website && (
                <div className="flex items-center gap-3 text-gray-600">
                  <FiGlobe className="w-5 h-5 text-gray-400" />
                  <a href={listing.contact.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 truncate">
                    {listing.contact.website}
                  </a>
                </div>
              )}
              {listing.location && (
                <div className="flex items-center gap-3 text-gray-600">
                  <FiMapPin className="w-5 h-5 text-gray-400" />
                  <span>{listing.location.city}, {listing.location.state}{listing.location.country ? `, ${listing.location.country}` : ''}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCompare}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
              compared
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
            }`}
          >
            <FiPlus className="w-5 h-5" />
            {compared ? 'Added to Compare' : 'Add to Compare'}
          </button>

          {isAuthenticated && (
            <button
              onClick={() => addFavoriteMutation.mutate()}
              disabled={addFavoriteMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-red-200 text-red-500 hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
            >
              <FiHeart className="w-5 h-5" />
              {addFavoriteMutation.isPending ? 'Adding...' : 'Add to Favorites'}
            </button>
          )}

          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
            <FiShare2 className="w-5 h-5" /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
