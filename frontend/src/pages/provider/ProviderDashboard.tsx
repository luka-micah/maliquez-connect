import { useQuery } from '@tanstack/react-query';
import SeoHead from '../../components/seo/SeoHead';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { useAuth } from '../../context/AuthContext';
import { listingApi } from '../../api/authApi';
import { FiPlus, FiList, FiStar, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { ApiResponse, Listing, User } from '../../types';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color?: string;
}

const StatCard = ({ icon: Icon, label, value, color = 'bg-primary-500' }: StatCardProps) => (
  <div className="bg-white rounded-md border border-gray-200 p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center`}>
      <Icon className={`w-6 h-6 ${color}`} />
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
      <SeoHead title="Provider Dashboard" noindex />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {businessName}</h1>
        <p className="text-gray-500 mt-1">Here is an overview of your listings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiList} label="Total Listings" value={total} color="text-blue-600" />
        <StatCard icon={FiCheckCircle} label="Approved" value={approved} color="text-green-600" />
        <StatCard icon={FiClock} label="Pending" value={pending} color="text-yellow-600" />
        <StatCard icon={FiAlertCircle} label="Suspended" value={suspended} color="text-red-600" />
      </div>

      {total === 0 && (
        <div className="bg-white rounded-md border border-gray-200 p-12 text-center">
          <FiList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-500 mb-6">Create your first listing to start reaching customers.</p>
          <Link
            to="/provider/listings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" /> Create Listing
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-md border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-semibold text-gray-900">Listing Status</h2>
          </div>
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-32 h-32">
              {(() => {
                const total = approved + pending + suspended || 1;
                const segs = [
                  { value: approved, color: '#7A1F5C', label: 'Approved' },
                  { value: pending, color: '#C15A9D', label: 'Pending' },
                  { value: suspended, color: '#D8B4D1', label: 'Suspended' },
                ];
                let offset = 0;
                const r = 70;
                const circ = 2 * Math.PI * r;
                return (
                  <>
                    {segs.filter(s => s.value > 0).map((seg) => {
                      const pct = seg.value / total;
                      const len = pct * circ;
                      const dash = `${len} ${circ - len}`;
                      const dashOffset = -offset;
                      offset += len;
                      return (
                        <circle key={seg.label} cx="80" cy="80" r={r} fill="none" stroke={seg.color} strokeWidth="20" strokeDasharray={dash} strokeDashoffset={dashOffset} transform="rotate(-90 80 80)" className="transition-all duration-500" />
                      );
                    })}
                    <text x="80" y="76" textAnchor="middle" fill="#111827" fontSize="22" fontWeight="bold">{total}</text>
                    <text x="80" y="92" textAnchor="middle" fill="#6b7280" fontSize="10">Total</text>
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
            {[
              { color: 'bg-[#7A1F5C]', label: 'Approved', value: approved },
              { color: 'bg-[#C15A9D]', label: 'Pending', value: pending },
              { color: 'bg-[#D8B4D1]', label: 'Suspended', value: suspended },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                {item.label} ({item.value})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-semibold text-gray-900">Monthly Listings</h2>
          </div>
          <svg viewBox="0 0 300 140" className="w-full h-auto">
            {(() => {
              const data = [
                { month: 'Feb', value: 1 },
                { month: 'Mar', value: 0 },
                { month: 'Apr', value: 3 },
                { month: 'May', value: 2 },
                { month: 'Jun', value: total },
                { month: 'Jul', value: 0 },
              ];
              const max = Math.max(...data.map(d => d.value), 1);
              const barW = 36;
              const gap = 12;
              const startX = 20;
              return (
                <>
                  {data.map((d, i) => {
                    const x = startX + i * (barW + gap);
                    const h = (d.value / max) * 100;
                    const y = 120 - h;
                    return (
                      <g key={d.month}>
                        <rect x={x} y={y} width={barW} height={Math.max(h, 1)} rx="4" fill="#7A1F5C" className="transition-all duration-500" />
                        <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill="#6b7280" fontSize="9">{d.value}</text>
                        <text x={x + barW / 2} y="134" textAnchor="middle" fill="#9ca3af" fontSize="9">{d.month}</text>
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-semibold text-gray-900">Rating Trend</h2>
          </div>
          <svg viewBox="0 0 300 140" className="w-full h-auto">
            <defs>
              <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7A1F5C" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#7A1F5C" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const data = [3.2, 3.5, 3.8, 4.0, 4.2, 4.5];
              const max = 5;
              const pts = data.map((v, i) => {
                const x = 20 + (i / (data.length - 1)) * 260;
                const y = 120 - (v / max) * 100;
                return `${x},${y}`;
              });
              return (
                <>
                  {[1, 2, 3, 4, 5].map((v) => {
                    const y = 120 - (v / max) * 100;
                    return (
                      <g key={v}>
                        <line x1={20} y1={y} x2={280} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                        <text x={16} y={y + 3} textAnchor="end" fill="#d1d5db" fontSize="8">{v}.0</text>
                      </g>
                    );
                  })}
                  <polyline fill="none" stroke="#7A1F5C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts.join(' ')} />
                  <polygon fill="url(#ratingGrad)" points={`20,120 ${pts.join(' ')} 280,120`} />
                  {data.map((v, i) => {
                    const x = 20 + (i / (data.length - 1)) * 260;
                    const y = 120 - (v / max) * 100;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="3.5" fill="#7A1F5C" stroke="white" strokeWidth="1.5" />
                        <text x={x} y={y - 10} textAnchor="middle" fill="#6b7280" fontSize="9">{v.toFixed(1)}</text>
                      </g>
                    );
                  })}
                  <text x={20 + (0 / (data.length - 1)) * 260} y="134" textAnchor="middle" fill="#9ca3af" fontSize="9">Feb</text>
                  <text x={20 + (2 / (data.length - 1)) * 260} y="134" textAnchor="middle" fill="#9ca3af" fontSize="9">Apr</text>
                  <text x={20 + (4 / (data.length - 1)) * 260} y="134" textAnchor="middle" fill="#9ca3af" fontSize="9">Jun</text>
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {total > 0 && (
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/provider/listings"
              className="flex items-center gap-3 p-4 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-md flex items-center justify-center">
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
              <div className="w-10 h-10 rounded-md flex items-center justify-center">
                <FiList className="w-5 h-5 text-primary-600" />
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
              <div className="w-10 h-10 rounded-md flex items-center justify-center">
                <FiStar className="w-5 h-5 text-primary-600" />
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
