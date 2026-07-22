import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/authApi';
import Pagination from '../../components/common/Pagination';
import { FiSearch, FiCheckCircle, FiXCircle, FiSend, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['', 'PROSPECT', 'CONTACTED', 'INTERESTED', 'REGISTERED', 'INVITED', 'ACCOUNT_CLAIMED', 'PROFILE_COMPLETED', 'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED'];

const STATUS_COLORS: Record<string, string> = {
  PROSPECT: 'bg-gray-100 text-gray-700',
  CONTACTED: 'bg-blue-100 text-blue-700',
  INTERESTED: 'bg-indigo-100 text-indigo-700',
  REGISTERED: 'bg-cyan-100 text-cyan-700',
  INVITED: 'bg-purple-100 text-purple-700',
  ACCOUNT_CLAIMED: 'bg-teal-100 text-teal-700',
  PROFILE_COMPLETED: 'bg-emerald-100 text-emerald-700',
  DOCUMENTS_SUBMITTED: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-green-100 text-green-700',
  PUBLISHED: 'bg-green-200 text-green-800',
  REJECTED: 'bg-red-100 text-red-700',
};

const AdminOnboardings = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModal, setRejectModal] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminOnboardings', page, search, statusFilter],
    queryFn: () =>
      adminApi.getOnboardings({ page, limit: 10, search: search || undefined, status: statusFilter || undefined }),
  });

  const onboardings: any[] = data?.data?.data || [];
  const pagination = (data?.data?.pagination || { page: 1 }) as any;

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveOnboarding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOnboardings'] });
      toast.success('Provider approved');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminApi.rejectOnboarding(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOnboardings'] });
      toast.success('Provider rejected');
      setRejectModal(null);
      setRejectReason('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => adminApi.publishOnboarding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOnboardings'] });
      toast.success('Provider published');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => adminApi.resetOnboarding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOnboardings'] });
      toast.success('Onboarding reset');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider Onboardings</h1>

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by business name, contact person, or email..."
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field sm:w-44"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.slice(1).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600">Failed to load onboardings.</p>
          </div>
        ) : onboardings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No onboardings found.</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Business</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Documents</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {onboardings.map((o: any) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{o.businessName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{o.contactPerson}<br /><span className="text-xs">{o.email}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{o.agent?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[o.onboardingStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {o.onboardingStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{o.documents?.length || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(o.onboardingStatus === 'UNDER_REVIEW' || o.onboardingStatus === 'DOCUMENTS_SUBMITTED') && (
                            <>
                              <button
                                onClick={() => approveMutation.mutate(o.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-700 hover:bg-green-100"
                                title="Approve"
                              >
                                <FiCheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setRejectModal(o.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-red-50 text-red-700 hover:bg-red-100"
                                title="Reject"
                              >
                                <FiXCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {o.onboardingStatus === 'APPROVED' && (
                            <button
                              onClick={() => publishMutation.mutate(o.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-700 hover:bg-green-100"
                              title="Publish"
                            >
                              <FiSend className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => resetMutation.mutate(o.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                            title="Reset to Prospect"
                          >
                            <FiRefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200">
              {onboardings.map((o: any) => (
                <div key={o.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{o.businessName}</h3>
                      <p className="text-xs text-gray-500">{o.contactPerson} · {o.agent?.name || 'No agent'}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[o.onboardingStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {o.onboardingStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{o.email} · {o.documents?.length || 0} documents</p>
                  <div className="flex gap-2 pt-1">
                    {(o.onboardingStatus === 'UNDER_REVIEW' || o.onboardingStatus === 'DOCUMENTS_SUBMITTED') && (
                      <>
                        <button onClick={() => approveMutation.mutate(o.id)}
                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700">Approve</button>
                        <button onClick={() => setRejectModal(o.id)}
                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700">Reject</button>
                      </>
                    )}
                    {o.onboardingStatus === 'APPROVED' && (
                      <button onClick={() => publishMutation.mutate(o.id)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700">Publish</button>
                    )}
                    <button onClick={() => resetMutation.mutate(o.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600">Reset</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reject Provider</h3>
            <p className="text-sm text-gray-600">Provide a reason for rejection (optional):</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="input-field w-full"
              placeholder="Reason for rejection..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectModal, reason: rejectReason || undefined })}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-500"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AdminOnboardings;
