import { useQuery } from '@tanstack/react-query';
import { agentApi } from '../../api/agentApi';
import { useState } from 'react';
import { FiClock, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ACTIVITY_ICONS: Record<string, string> = {
  PHONE_CALL: '📞', WHATSAPP: '💬', SMS: '📱', EMAIL: '📧',
  OFFICE_VISIT: '🏢', MEETING: '🤝', FOLLOW_UP: '🔄', OTHER: '📝',
};

const FollowUps = () => {
  const [tab, setTab] = useState<'today' | 'upcoming' | 'overdue'>('today');

  const { data, isLoading } = useQuery({
    queryKey: ['agent-followups'],
    queryFn: async () => {
      const res = await agentApi.getFollowUps();
      return res.data.data;
    },
  });

  const tabs = [
    { key: 'today', label: 'Today', count: data?.todaysFollowUps?.length || 0, icon: FiClock },
    { key: 'upcoming', label: 'Upcoming', count: data?.upcomingFollowUps?.length || 0, icon: FiCalendar },
    { key: 'overdue', label: 'Overdue', count: data?.overdueFollowUps?.length || 0, icon: FiAlertCircle },
  ] as const;

  const currentItems = data?.[`${tab}FollowUps` as keyof typeof data] as any[] || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>

      <div className="flex gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {currentItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FiClock className="w-12 h-12 mx-auto mb-3" />
            <p>No {tab} follow-ups</p>
          </div>
        ) : (
          currentItems.map((item: any) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3">
                <span className="text-lg">{ACTIVITY_ICONS[item.activityType] || '📝'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {item.onboarding?.businessName || 'Unknown Business'}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(item.nextFollowUp).toLocaleDateString()} {new Date(item.nextFollowUp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{item.onboarding?.contactPerson}</p>
                  {item.note && <p className="text-sm text-gray-600 mt-1">{item.note}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">{item.activityType.replace(/_/g, ' ')}</span>
                    {item.onboarding?.id && (
                      <Link
                        to={`/agent/providers/${item.onboarding.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Provider
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowUps;
