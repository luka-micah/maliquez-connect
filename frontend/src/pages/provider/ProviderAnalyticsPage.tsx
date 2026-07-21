import { useQuery } from '@tanstack/react-query';
import SeoHead from '../../components/seo/SeoHead';
import { AxiosResponse } from 'axios';
import { listingApi } from '../../api/authApi';
import { FiList, FiCheckCircle, FiClock, FiStar, FiMessageSquare } from 'react-icons/fi';
import { ApiResponse, Listing } from '../../types';

const colorMap: Record<string, string> = {
  APPROVED: 'bg-green-500',
  PENDING: 'bg-yellow-500',
  SUSPENDED: 'bg-red-500',
};

interface AnalyticsBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

const AnalyticsBar = ({ label, count, total, color }: AnalyticsBarProps) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 capitalize">{label}</span>
        <span className="text-gray-500">{count} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const ProviderAnalyticsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingApi.getMine(),
  });

  const listings: Listing[] = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load analytics data. Please try again.</p>
      </div>
    );
  }

  const total = listings.length;
  const approved = listings.filter((l: Listing) => l.status === 'APPROVED').length;
  const pending = listings.filter((l: Listing) => l.status === 'PENDING').length;
  const suspended = listings.filter((l: Listing) => l.status === 'SUSPENDED').length;
  const totalReviews = listings.reduce((sum: number, l: Listing) => sum + (l.reviewCount || 0), 0);
  const avgRating =
    listings.length > 0
      ? (listings.reduce((sum: number, l: Listing) => sum + (l.averageRating || 0), 0) / listings.length).toFixed(1)
      : '0.0';

  const statusCounts = [
    { label: 'approved', count: approved, color: colorMap.APPROVED },
    { label: 'pending', count: pending, color: colorMap.PENDING },
    { label: 'suspended', count: suspended, color: colorMap.SUSPENDED },
  ];

  return (
    <div className="space-y-6">
      <SeoHead title="Analytics" noindex />
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-md border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center">
              <FiList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Listings</p>
              <p className="text-xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Approved</p>
              <p className="text-xl font-bold text-gray-900">{approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center">
              <FiClock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">{pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center">
              <FiStar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Rating</p>
              <p className="text-xl font-bold text-gray-900">{avgRating}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Reviews</p>
              <p className="text-xl font-bold text-gray-900">{totalReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {total === 0 && (
        <div className="bg-white rounded-md border border-gray-200 p-12 text-center">
          <FiList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No data to analyze</h3>
          <p className="text-gray-500">Create listings first to see your analytics.</p>
        </div>
      )}

      {total > 0 && (
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Listing Status Distribution</h2>
          <div className="space-y-4">
            {statusCounts.map((s) => (
              <AnalyticsBar key={s.label} label={s.label} count={s.count} total={total} color={s.color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderAnalyticsPage;
