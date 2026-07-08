import { Link } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';
import { FiMessageSquare, FiSearch, FiStar } from 'react-icons/fi';

const UserReviews = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SeoHead title="My Reviews" noindex />
      <div className="flex items-center gap-3 mb-8">
        <FiStar className="w-6 h-6 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
      </div>

      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiMessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">No reviews yet</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Your reviews appear here once you leave them on listings. Share your experience
          and help others make informed decisions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/search"
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            <FiSearch className="w-4 h-4" />
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserReviews;
