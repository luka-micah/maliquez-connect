import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

interface StarRatingProps {
  rating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating = ({ rating = 0, onRate, readonly = false, size = 'md' }: StarRatingProps) => {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <FiStar
            className={`${sizeClass} ${
              star <= (hover || rating)
                ? 'text-[#F4B400] fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
