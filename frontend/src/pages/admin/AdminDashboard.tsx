import { useQuery } from '@tanstack/react-query';
import SeoHead from '../../components/seo/SeoHead';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { adminApi } from '../../api/authApi';
import { FiUsers, FiBriefcase, FiList, FiStar, FiClock, FiAlertCircle, FiUserCheck, FiFolder } from 'react-icons/fi';
import { ApiResponse, type AdminDashboard } from '../../types';

interface StatCardConfig {
  key: keyof AdminDashboard;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  link: string;
}

const statCards: StatCardConfig[] = [
  { key: 'totalUsers', label: 'Total Users', icon: FiUsers, color: 'bg-blue-500', link: '/admin/users' },
  { key: 'totalProviders', label: 'Total Providers', icon: FiBriefcase, color: 'bg-green-500', link: '/admin/providers' },
  { key: 'totalListings', label: 'Total Listings', icon: FiList, color: 'bg-purple-500', link: '/admin/listings' },
  { key: 'totalReviews', label: 'Total Reviews', icon: FiStar, color: 'bg-amber-500', link: '/admin/reviews' },
  { key: 'pendingListings', label: 'Pending Listings', icon: FiClock, color: 'bg-orange-500', link: '/admin/listings' },
  { key: 'pendingReviews', label: 'Pending Reviews', icon: FiAlertCircle, color: 'bg-red-500', link: '/admin/reviews' },
];

interface QuickLinkConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const quickLinks: QuickLinkConfig[] = [
  { label: 'Manage Users', icon: FiUserCheck, href: '/admin/users' },
  { label: 'Manage Listings', icon: FiList, href: '/admin/listings' },
  { label: 'Manage Categories', icon: FiFolder, href: '/admin/categories' },
];

const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery<AxiosResponse<ApiResponse<AdminDashboard>>>({
    queryKey: ['adminDashboard'],
    queryFn: adminApi.getDashboard,
  });

  const stats: Partial<AdminDashboard> = data?.data?.data || {};

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SeoHead title="Admin Dashboard" noindex />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map(({ key, label, icon: Icon, color, link }) => (
          <Link key={key} to={link} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${color} p-3 rounded-lg text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{stats[key] ?? 0}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            to={href}
            className="card p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
