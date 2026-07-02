import { useState } from 'react';
import { FiStar, FiThumbsUp, FiFlag } from 'react-icons/fi';
import type { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (id: string) => void;
  onReport?: (id: string) => void;
}

const ReviewCard = ({ review, onHelpful, onReport }: ReviewCardProps) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [helped, setHelped] = useState(false);

  const handleHelpful = () => {
    if (!helped && onHelpful) {
      onHelpful(review.id);
      setHelpfulCount((c) => c + 1);
      setHelped(true);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">{review.user?.firstName} {review.user?.lastName}</p>
            <div className="flex items-center gap-1 mt-1">{renderStars(review.rating)}</div>
          </div>
        </div>
        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>

      {review.review && <p className="mt-3 text-gray-600 text-sm">{review.review}</p>}

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-1 text-sm ${helped ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
        >
          <FiThumbsUp className="w-4 h-4" />
          Helpful ({helpfulCount})
        </button>
        {onReport && (
          <button onClick={() => onReport(review.id)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500">
            <FiFlag className="w-4 h-4" /> Report
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
