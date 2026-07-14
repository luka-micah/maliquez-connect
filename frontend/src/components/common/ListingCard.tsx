import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiHeart, FiSend } from 'react-icons/fi';
import type { Category, Listing } from '../../types';

interface ListingCardProps {
  listing: Listing;
  onFavorite?: (id: string) => void;
}

const ListingCard = ({ listing, onFavorite }: ListingCardProps) => {
  const imageUrl = listing.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="card hover:shadow-md transition-shadow">
      <Link to={`/listings/${listing.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          {listing.verified === 'VERIFIED' && (
            <span className="absolute top-2 left-2 badge-success text-xs">Verified</span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Link to={`/listings/${listing.id}`}>
              <h3 className="font-semibold text-primary-700 hover:text-primary-800">{listing.title}</h3>
            </Link>
            <p className="text-xs text-gray-500 mt-1">{(listing.category as Category)?.name} &middot; {listing.sector}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/listings/${listing.id}`}
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm"
              aria-label={`Message ${listing.title}`}
            >
              <FiSend className="w-4 h-4" />
              <span>Message</span>
            </Link>
            {onFavorite && (
              <button onClick={() => onFavorite(listing.id)} className="text-gray-400 hover:text-red-500">
                <FiHeart className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {listing.location && (
          <p className="flex items-center gap-1 text-sm text-gray-500 mt-2">
            <FiMapPin className="w-3 h-3" />
            {listing.location.city}, {listing.location.state}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <FiStar className="w-4 h-4 text-[#F4B400] fill-current" />
            <span className="text-sm font-medium">{listing.averageRating?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-gray-400">({listing.reviewCount || 0})</span>
          </div>
          {listing.pricing?.minimum && (
            <span className="text-sm font-medium text-primary-600">
              {listing.pricing.currency} {listing.pricing.minimum.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
