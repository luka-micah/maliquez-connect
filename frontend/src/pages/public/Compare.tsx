import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { listingApi } from '../../api/authApi';
import SeoHead from '../../components/seo/SeoHead';
import { FiStar, FiMapPin, FiCheck, FiX, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import StarRating from '../../components/common/StarRating';
import { ApiResponse, Listing } from '../../types';

const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const idsParam = searchParams.get('ids') || '';
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    const stored: string[] = JSON.parse(localStorage.getItem('compareIds') || '[]');
    if (idsParam) {
      const urlIds = idsParam.split(',').filter(Boolean);
      setCompareIds(urlIds);
    } else {
      setCompareIds(stored);
    }
  }, [idsParam]);

  useEffect(() => {
    if (!idsParam && compareIds.length > 0) {
      setSearchParams({ ids: compareIds.join(',') }, { replace: true });
    }
  }, [compareIds, idsParam, setSearchParams]);

  const listingsQuery = useQuery({
    queryKey: ['compare-listings', compareIds],
    queryFn: async () => {
      const results = await Promise.allSettled(
        compareIds.map((id: string) => listingApi.getById(id))
      );
      return results
        .filter((r): r is PromiseFulfilledResult<AxiosResponse<ApiResponse<Listing>>> => r.status === 'fulfilled')
        .map((r) => r.value.data.data) as Listing[];
    },
    enabled: compareIds.length > 0,
  });

  const listings: Listing[] = listingsQuery.data || [];

  const removeFromCompare = (id: string) => {
    const updated = compareIds.filter((cid) => cid !== id);
    setCompareIds(updated);
    localStorage.setItem('compareIds', JSON.stringify(updated));
    if (updated.length === 0) {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ ids: updated.join(',') }, { replace: true });
    }
  };

  const clearAll = () => {
    setCompareIds([]);
    localStorage.setItem('compareIds', JSON.stringify([]));
    setSearchParams({}, { replace: true });
  };

  const allFeatures: string[] = [...new Set(listings.flatMap((l) => l.features || []))];

  if (compareIds.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <SeoHead
          title="Compare Listings"
          description="Compare service providers side by side on Maliquez Connect. Make informed decisions with our comparison tool."
          canonical="/compare"
          noindex
        />
        <FiStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No listings to compare</h2>
        <p className="text-gray-500 mb-6">Add listings from their detail page to start comparing.</p>
        <Link to="/search" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
          <FiArrowLeft className="w-4 h-4" /> Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SeoHead
        title="Compare Listings"
        description="Compare service providers side by side on Maliquez Connect. Make informed decisions with our comparison tool."
        canonical="/compare"
        noindex
      />
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/search" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2">
            <FiArrowLeft className="w-4 h-4" /> Back to search
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Compare Listings</h1>
          <p className="text-gray-500 mt-1">{listings.length} listing{listings.length !== 1 ? 's' : ''} selected</p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium text-sm"
        >
          <FiTrash2 className="w-4 h-4" /> Clear All
        </button>
      </div>

      {listingsQuery.isLoading && (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-4">Loading listings...</p>
        </div>
      )}

      {listingsQuery.error && (
        <div className="text-center py-16">
          <p className="text-gray-500">Failed to load some listings. Please try again.</p>
        </div>
      )}

      {!listingsQuery.isLoading && !listingsQuery.error && listings.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No valid listings found to compare.</p>
        </div>
      )}

      {!listingsQuery.isLoading && listings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-500 w-40 bg-gray-50 border border-gray-200">Feature</th>
                {listings.map((listing) => (
                  <th key={listing.id} className="p-3 text-center bg-gray-50 border border-gray-200 min-w-[200px]">
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(listing.id)}
                        className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">Image</td>
                {listings.map((listing) => (
                  <td key={listing.id} className="p-3 border border-gray-200">
                    <Link to={`/listings/${listing.id}`}>
                      <img
                        src={listing.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={listing.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </Link>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">Title</td>
                {listings.map((listing) => (
                  <td key={listing.id} className="p-3 border border-gray-200">
                    <Link to={`/listings/${listing.id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                      {listing.title}
                    </Link>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">Sector</td>
                {listings.map((listing) => (
                  <td key={listing.id} className="p-3 border border-gray-200">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                      {listing.sector}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">Category</td>
                {listings.map((listing) => (
                  <td key={listing.id} className="p-3 border border-gray-200 text-sm text-gray-600">
                    {typeof listing.category === 'object' ? listing.category?.name || '-' : listing.category || '-'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">Rating</td>
                {listings.map((listing) => (
                  <td key={listing.id} className="p-3 border border-gray-200">
                    <div className="flex flex-col items-center gap-1">
                      <StarRating rating={Math.round(listing.averageRating || 0)} readonly size="sm" />
                      <span className="text-sm text-gray-500">({listing.reviewCount || 0})</span>
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">Location</td>
                {listings.map((listing) => (
                  <td key={listing.id} className="p-3 border border-gray-200">
                    {listing.location ? (
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <FiMapPin className="w-3.5 h-3.5" />
                        {listing.location.city}, {listing.location.state}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">Pricing</td>
                {listings.map((listing) => (
                  <td key={listing.id} className="p-3 border border-gray-200 text-center">
                    {listing.pricing?.minimum ? (
                      <span className="font-semibold text-primary-600">
                        {listing.pricing.currency || '$'}{listing.pricing.minimum.toLocaleString()}
                        {listing.pricing.maximum && (
                          <span className="text-gray-400 font-normal">
                            {' '}- {listing.pricing.currency || '$'}{listing.pricing.maximum.toLocaleString()}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">Verified</td>
                {listings.map((listing) => (
                  <td key={listing.id} className="p-3 border border-gray-200 text-center">
                    {listing.verified === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <FiCheck className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>

              {allFeatures.length > 0 && (
                <tr>
                  <td className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">Features</td>
                  {listings.map((listing) => (
                    <td key={listing.id} className="p-3 border border-gray-200">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {(listing.features || []).length > 0 ? (
                          listing.features.map((f: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                              <FiCheck className="w-3 h-3" /> {f}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              )}

              <tr>
                <td className="p-3 bg-gray-50 border border-gray-200" />
                {listings.map((listing) => (
                  <td key={listing.id} className="p-3 border border-gray-200 text-center">
                    <button
                      onClick={() => removeFromCompare(listing.id)}
                      className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Compare;
