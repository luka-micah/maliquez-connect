import { Link } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <SeoHead
      title="Page Not Found"
      description="The page you are looking for does not exist. Browse our verified service providers or go back to the homepage."
      noindex
    />
    <div className="text-center max-w-md">
      <div className="text-8xl font-extrabold text-primary-600/20 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8 leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Go Home
        </Link>
        <Link
          to="/search"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
        >
          <FiSearch className="w-4 h-4" />
          Browse Listings
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
