import { useQuery } from '@tanstack/react-query';
import SeoHead from '../../components/seo/SeoHead';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { adminApi } from '../../api/authApi';
import { FiUsers, FiBriefcase, FiList, FiStar, FiClock, FiAlertCircle, FiUserCheck, FiFolder, FiTrendingUp, FiPieChart, FiCalendar } from 'react-icons/fi';
import { ApiResponse, type AdminDashboard } from '../../types';

interface StatCardConfig {
  key: keyof AdminDashboard;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  link: string;
}

const statCards: StatCardConfig[] = [
  { key: 'totalUsers', label: 'Total Users', icon: FiUsers, color: 'bg-primary-600', link: '/admin/users' },
  { key: 'totalProviders', label: 'Total Providers', icon: FiBriefcase, color: 'bg-primary-600', link: '/admin/providers' },
  { key: 'totalListings', label: 'Total Listings', icon: FiList, color: 'bg-primary-600', link: '/admin/listings' },
  { key: 'totalReviews', label: 'Total Reviews', icon: FiStar, color: 'bg-primary-600', link: '/admin/reviews' },
  { key: 'pendingListings', label: 'Pending Listings', icon: FiClock, color: 'bg-primary-600', link: '/admin/listings' },
  { key: 'pendingReviews', label: 'Pending Reviews', icon: FiAlertCircle, color: 'bg-primary-600', link: '/admin/reviews' },
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
                <div className="w-12 h-12 bg-gray-200 rounded-md" />
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
              <div className={`${color} p-3 rounded-md text-white`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-semibold text-gray-900">Monthly Signups (2026)</h2>
          </div>
          <svg viewBox="0 0 300 140" className="w-full h-auto">
            <defs>
              <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7A1F5C" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#7A1F5C" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const data = [40, 85, 70, 110, 95, 140, 130, 170, 155, 200, 185, 230];
              const max = Math.max(...data, 1);
              const pts = data.map((v, i) => {
                const x = 20 + (i / (data.length - 1)) * 260;
                const y = 120 - (v / max) * 100;
                return `${x},${y}`;
              });
              return (
                <>
                  <polyline fill="none" stroke="#7A1F5C" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pts.join(' ')} />
                  <polygon fill="url(#signupGrad)" points={`20,120 ${pts.join(' ')} 280,120`} />
                  {data.map((v, i) => {
                    const x = 20 + (i / (data.length - 1)) * 260;
                    const y = 120 - (v / max) * 100;
                    return i % 2 === 0 ? <text key={i} x={x} y="135" textAnchor="middle" fill="#9ca3af" fontSize="9">{['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'][i / 2]}</text> : null;
                  })}
                </>
              );
            })()}
          </svg>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-semibold text-gray-900">Content Distribution</h2>
          </div>
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-36 h-36">
              {(() => {
                const total = (stats.totalUsers || 0) + (stats.totalListings || 0) + (stats.totalReviews || 0) || 1;
                const segs = [
                  { value: stats.totalUsers || 0, color: '#7A1F5C', label: 'Users' },
                  { value: stats.totalListings || 0, color: '#C15A9D', label: 'Listings' },
                  { value: stats.totalReviews || 0, color: '#D8B4D1', label: 'Reviews' },
                ];
                let offset = 0;
                const r = 70;
                const circ = 2 * Math.PI * r;
                return (
                  <>
                    {segs.map((seg) => {
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
          <div className="flex items-center justify-center gap-4 mt-3">
            {[
              { color: 'bg-[#7A1F5C]', label: 'Users', value: stats.totalUsers },
              { color: 'bg-[#C15A9D]', label: 'Listings', value: stats.totalListings },
              { color: 'bg-[#D8B4D1]', label: 'Reviews', value: stats.totalReviews },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                {item.label} ({item.value ?? 0})
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiCalendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-semibold text-gray-900">Weekly Activity</h2>
          </div>
          <svg viewBox="0 0 300 140" className="w-full h-auto">
            {(() => {
              const data = [
                { day: 'Mon', value: 45 },
                { day: 'Tue', value: 70 },
                { day: 'Wed', value: 55 },
                { day: 'Thu', value: 85 },
                { day: 'Fri', value: 60 },
                { day: 'Sat', value: 35 },
                { day: 'Sun', value: 25 },
              ];
              const max = Math.max(...data.map(d => d.value), 1);
              const barW = 28;
              const gap = 10;
              const startX = 15;
              return (
                <>
                  {[0, 25, 50, 75, 100].map((v) => {
                    const y = 120 - (v / 100) * 100;
                    return (
                      <g key={v}>
                        <line x1={startX} y1={y} x2={startX + data.length * (barW + gap)} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                        <text x={startX - 4} y={y + 3} textAnchor="end" fill="#d1d5db" fontSize="8">{v}</text>
                      </g>
                    );
                  })}
                  {data.map((d, i) => {
                    const x = startX + i * (barW + gap);
                    const h = (d.value / max) * 100;
                    const y = 120 - h;
                    return (
                      <g key={d.day}>
                        <rect x={x} y={y} width={barW} height={h} rx="4" fill="#7A1F5C" className="transition-all duration-500" />
                        <text x={x + barW / 2} y="134" textAnchor="middle" fill="#9ca3af" fontSize="9">{d.day}</text>
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
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
