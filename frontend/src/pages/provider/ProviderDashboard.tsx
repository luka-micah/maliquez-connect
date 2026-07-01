import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { useAuth } from '../../context/AuthContext';
import { listingApi } from '../../api/authApi';
import { FiPlus, FiList, FiStar, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { ApiResponse, Listing, User } from '../../types';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

interface AuthContextType {
  user: User | null;
}

const ProviderDashboard = () => {
  const { user } = useAuth() as unknown as AuthContextType;
  const businessName = user?.providerProfile?.businessName || (user?.firstName ? `${user.firstName}'s` : '');

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingApi.getMine(),
  });

  const listings: Listing[] = data?.data?.data || [];
  const total = listings.length;
  const approved = listings.filter((l: Listing) => l.status === 'APPROVED').length;
  const pending = listings.filter((l: Listing) => l.status === 'PENDING').length;
  const suspended = listings.filter((l: Listing) => l.status === 'SUSPENDED').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {businessName}</h1>
        <p className="text-gray-500 mt-1">Here is an overview of your listings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiList} label="Total Listings" value={total} color="bg-blue-500" />
        <StatCard icon={FiCheckCircle} label="Approved" value={approved} color="bg-green-500" />
        <StatCard icon={FiClock} label="Pending" value={pending} color="bg-yellow-500" />
        <StatCard icon={FiAlertCircle} label="Suspended" value={suspended} color="bg-red-500" />
      </div>

      {total === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FiList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-500 mb-6">Create your first listing to start reaching customers.</p>
          <Link
            to="/provider/listings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" /> Create Listing
          </Link>
        </div>
      )}

      {total > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/provider/listings"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <FiPlus className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Listing</p>
                <p className="text-sm text-gray-500">Add a new business listing</p>
              </div>
            </Link>
            <Link
              to="/provider/listings"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FiList className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Listings</p>
                <p className="text-sm text-gray-500">Manage your listings</p>
              </div>
            </Link>
            <Link
              to="/provider/reviews"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FiStar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Reviews</p>
                <p className="text-sm text-gray-500">See what customers say</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
