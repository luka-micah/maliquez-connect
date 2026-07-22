import { useQuery } from '@tanstack/react-query';
import { agentApi } from '../../api/agentApi';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiCalendar } from 'react-icons/fi';

const ACTIVITY_ICONS: Record<string, string> = {
  PHONE_CALL: '📞', WHATSAPP: '💬', SMS: '📱', EMAIL: '📧',
  OFFICE_VISIT: '🏢', MEETING: '🤝', FOLLOW_UP: '🔄', OTHER: '📝',
};

const ACTIVITY_TYPES = [
  'ALL', 'PHONE_CALL', 'WHATSAPP', 'SMS', 'EMAIL',
  'OFFICE_VISIT', 'MEETING', 'FOLLOW_UP', 'OTHER',
];

const Activities = () => {
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['agent-activities', page, filterType],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 30 };
      if (filterType !== 'ALL') params.activityType = filterType;
      const res = await agentApi.getActivities(params);
      return { activities: res.data.data, pagination: res.data.pagination };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {data?.activities?.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FiCalendar className="w-12 h-12 mx-auto mb-3" />
            <p>No activities recorded</p>
          </div>
        ) : (
          data?.activities?.map((activity: any) => (
            <div key={activity.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3">
                <span className="text-lg">{ACTIVITY_ICONS[activity.activityType] || '📝'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                        {activity.activityType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {activity.note && <p className="text-sm text-gray-700 mt-1">{activity.note}</p>}
                  {activity.onboarding && (
                    <div className="mt-1">
                      <Link
                        to={`/agent/providers/${activity.onboarding.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        {activity.onboarding.businessName} — {activity.onboarding.contactPerson}
                      </Link>
                    </div>
                  )}
                  {activity.nextFollowUp && (
                    <p className="text-xs text-primary-600 mt-1">
                      Follow-up: {new Date(activity.nextFollowUp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!data.pagination.hasPrevPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
              Previous
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={!data.pagination.hasNextPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
