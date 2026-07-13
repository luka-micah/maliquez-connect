import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SeoHead from '../../components/seo/SeoHead';
import { adminApi } from '../../api/authApi';
import { FiArrowLeft, FiList, FiCheckCircle, FiClock, FiStar, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { ApiResponse, ProviderAnalytics } from '../../types';

const colorMap: Record<string, string> = {
  approved: 'bg-green-500',
  pending: 'bg-yellow-500',
  suspended: 'bg-red-500',
};

const AnalyticsBar = ({ label, count, total, color }: { label: string; count: number; total: number; color: string }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 capitalize">{label}</span>
        <span className="text-gray-500">{count} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const AdminProviderAnalytics = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminProviderAnalytics', id],
    queryFn: () => adminApi.getProviderAnalytics(id!),
    enabled: !!id,
  });

  const analytics: ProviderAnalytics | undefined = data?.data?.data;

  if (!id) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider Analytics</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">No provider ID provided.</p>
          <Link to="/admin/providers" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mt-4">
            <FiArrowLeft className="w-4 h-4" /> Back to Providers
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider Analytics</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load analytics for this provider.</p>
          <Link to="/admin/providers" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mt-4">
            <FiArrowLeft className="w-4 h-4" /> Back to Providers
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Listings', value: analytics?.totalListings ?? 0, icon: FiList, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Approved', value: analytics?.listingsByStatus?.approved ?? 0, icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending', value: analytics?.listingsByStatus?.pending ?? 0, icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Avg Rating', value: analytics?.averageRating?.toFixed(1) ?? '0.0', icon: FiStar, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Total Reviews', value: analytics?.totalReviews ?? 0, icon: FiMessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const statusEntries = analytics?.listingsByStatus
    ? [
        { label: 'approved', count: analytics.listingsByStatus.approved, color: colorMap.approved },
        { label: 'pending', count: analytics.listingsByStatus.pending, color: colorMap.pending },
        { label: 'suspended', count: analytics.listingsByStatus.suspended, color: colorMap.suspended },
      ]
    : [];

  const totalListings = analytics?.totalListings ?? 0;

  return (
    <div>
      <SeoHead title="Admin — Provider Analytics" noindex />
      <Link to="/admin/providers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <FiArrowLeft className="w-4 h-4" /> Back to Providers
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider Analytics</h1>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-5 bg-gray-200 rounded w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-48 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded-full w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalListings === 0 ? (
            <div className="card p-12 text-center">
              <FiList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500">This provider hasn't created any listings.</p>
            </div>
          ) : (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Listing Status Distribution</h2>
              <div className="space-y-4">
                {statusEntries.map((s) => (
                  <AnalyticsBar key={s.label} label={s.label} count={s.count} total={totalListings} color={s.color} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProviderAnalytics;
