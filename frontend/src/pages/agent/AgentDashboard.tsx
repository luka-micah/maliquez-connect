import { useQuery } from '@tanstack/react-query';
import { agentApi } from '../../api/agentApi';
import { FiUsers, FiMail, FiCheckCircle, FiXCircle, FiClock, FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const statCards = [
  { key: 'totalBusinessesContacted', label: 'Businesses Contacted', icon: FiUsers, color: 'text-blue-500' },
  { key: 'totalRegistered', label: 'Registered', icon: FiUserCheck, color: 'text-green-500' },
  { key: 'totalInvitationsSent', label: 'Invitations Sent', icon: FiMail, color: 'text-indigo-500' },
  { key: 'pendingClaims', label: 'Pending Claims', icon: FiClock, color: 'text-yellow-500' },
  { key: 'pendingReviews', label: 'Pending Reviews', icon: FiTrendingUp, color: 'text-orange-500' },
  { key: 'approvedProviders', label: 'Approved', icon: FiCheckCircle, color: 'text-emerald-500' },
  { key: 'rejectedProviders', label: 'Rejected', icon: FiXCircle, color: 'text-red-500' },
  { key: 'approvalRate', label: 'Approval Rate (%)', icon: FiTrendingUp, color: 'text-purple-500' },
];

const AgentDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['agent-dashboard'],
    queryFn: async () => {
      const res = await agentApi.getDashboard();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const d = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
        <Link
          to="/agent/providers?action=create"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 text-sm font-medium"
        >
          + Register Provider
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = d?.[card.key as keyof typeof d];
          return (
            <div key={card.key} className="bg-white rounded-md p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{String(value ?? 0)}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-md p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Registrations</h2>
          {d?.monthlyRegistrations && d.monthlyRegistrations.length > 0 ? (
            <div className="space-y-2">
              {d.monthlyRegistrations.map((r: any) => (
                <div key={r.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{r.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-primary-500 rounded-full"
                        style={{ width: `${Math.min(100, (r.count / Math.max(...d.monthlyRegistrations.map((x: any) => x.count))) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{r.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data yet</p>
          )}
        </div>

        <div className="bg-white rounded-md p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Follow-ups</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary-600 rounded-md">
              <div>
                <p className="text-sm font-medium text-primary-100">Overdue</p>
                <p className="text-xs text-primary-200">Requires immediate attention</p>
              </div>
              <span className="text-xl font-bold text-primary-200">{d?.overdueFollowUps?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary-500 rounded-md">
              <div>
                <p className="text-sm font-medium text-primary-100">Today</p>
                <p className="text-xs text-primary-200">Scheduled for today</p>
              </div>
              <span className="text-xl font-bold text-primary-200">{d?.todaysFollowUps?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary-400 rounded-md">
              <div>
                <p className="text-sm font-medium text-primary-100">Upcoming</p>
                <p className="text-xs text-primary-200">Future follow-ups</p>
              </div>
              <span className="text-xl font-bold text-primary-200">{d?.upcomingFollowUps?.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
