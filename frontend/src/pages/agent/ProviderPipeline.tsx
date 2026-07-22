import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../../api/agentApi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const PIPELINE_COLUMNS = [
  { key: 'PROSPECT', label: 'Prospects', color: 'bg-gray-100' },
  { key: 'CONTACTED', label: 'Contacted', color: 'bg-blue-50' },
  { key: 'INTERESTED', label: 'Interested', color: 'bg-indigo-50' },
  { key: 'REGISTERED', label: 'Registered', color: 'bg-cyan-50' },
  { key: 'INVITED', label: 'Invited', color: 'bg-purple-50' },
  { key: 'ACCOUNT_CLAIMED', label: 'Claimed', color: 'bg-teal-50' },
  { key: 'PROFILE_COMPLETED', label: 'Profile Done', color: 'bg-emerald-50' },
  { key: 'DOCUMENTS_SUBMITTED', label: 'Documents In', color: 'bg-yellow-50' },
  { key: 'UNDER_REVIEW', label: 'Review', color: 'bg-orange-50' },
  { key: 'APPROVED', label: 'Approved', color: 'bg-green-50' },
  { key: 'PUBLISHED', label: 'Published', color: 'bg-green-200' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-red-50' },
];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PROSPECT: ['CONTACTED'],
  CONTACTED: ['INTERESTED', 'PROSPECT'],
  INTERESTED: ['REGISTERED', 'CONTACTED'],
  REGISTERED: ['INVITED'],
  INVITED: ['ACCOUNT_CLAIMED'],
  ACCOUNT_CLAIMED: ['PROFILE_COMPLETED'],
  PROFILE_COMPLETED: ['DOCUMENTS_SUBMITTED'],
  DOCUMENTS_SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PUBLISHED'],
};

const ProviderPipeline = () => {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const { data: providersData, isLoading } = useQuery({
    queryKey: ['agent-providers'],
    queryFn: async () => {
      const res = await agentApi.getProviders({ limit: 200 });
      return res.data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      agentApi.updateProviderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-providers'] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
      toast.success('Status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  const providers = providersData || [];
  const columns = PIPELINE_COLUMNS.map((col) => ({
    ...col,
    items: providers.filter((p: any) => p.onboardingStatus === col.key),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Provider Pipeline</h1>
        <Link
          to="/agent/providers?action=create"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 text-sm font-medium"
        >
          + Register Provider
        </Link>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((col) => (
            <div key={col.key} className={`w-72 rounded-xl ${col.color} p-3`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-700">{col.label}</h3>
                <span className="text-xs bg-white/80 px-2 py-1 rounded-full text-gray-500">
                  {col.items.length}
                </span>
              </div>
              <div className="space-y-2">
                {col.items.map((provider: any) => (
                  <div
                    key={provider.id}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                  >
                    <p className="font-medium text-sm text-gray-900 truncate">{provider.businessName}</p>
                    <p className="text-xs text-gray-500 mt-1">{provider.contactPerson}</p>
                    <p className="text-xs text-gray-400 truncate">{provider.email}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {(STATUS_TRANSITIONS[provider.onboardingStatus as keyof typeof STATUS_TRANSITIONS] || []).map((nextStatus) => (
                        <button
                          key={nextStatus}
                          onClick={(e) => {
                            e.stopPropagation();
                            statusMutation.mutate({ id: provider.id, status: nextStatus });
                          }}
                          className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-primary-100 hover:text-primary-700 text-gray-600 transition-colors"
                        >
                          {nextStatus.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                    {selectedProvider === provider.id && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <Link
                          to={`/agent/providers/${provider.id}`}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
                {col.items.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No providers</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderPipeline;
