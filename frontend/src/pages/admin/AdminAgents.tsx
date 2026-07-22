import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/authApi';
import Pagination from '../../components/common/Pagination';
import { FiSearch, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusOptions = ['', 'PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'];

const AdminAgents = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminAgents', page, search, statusFilter],
    queryFn: () =>
      adminApi.getAgents({ page, limit: 10, search: search || undefined, status: statusFilter || undefined }),
  });

  const agents: any[] = data?.data?.data || [];
  const pagination = (data?.data?.pagination || { page: 1 }) as any;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateAgentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAgents'] });
      toast.success('Agent status updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Agents</h1>

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or referral code..."
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field sm:w-40"
          >
            <option value="">All Status</option>
            {statusOptions.slice(1).map((s) => (
              <option key={s} value={s}>{s}</option>
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
            <p className="text-gray-600">Failed to load agents.</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No agents found.</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Referral Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Providers</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.map((agent: any) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{agent.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{agent.user?.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{agent.referralCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{agent._count?.providerOnboardings || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          agent.status === 'ACTIVE' ? 'badge-success' :
                          agent.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                        }`}>{agent.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          agent.user?.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'
                        }`}>{agent.user?.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {agent.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: agent.id, status: 'ACTIVE' })}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                              >
                                <FiCheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: agent.id, status: 'INACTIVE' })}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                              >
                                <FiXCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
                          {agent.status === 'ACTIVE' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: agent.id, status: 'SUSPENDED' })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              <FiXCircle className="w-3.5 h-3.5" /> Suspend
                            </button>
                          )}
                          {(agent.status === 'SUSPENDED' || agent.status === 'INACTIVE') && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: agent.id, status: 'ACTIVE' })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              <FiCheckCircle className="w-3.5 h-3.5" /> Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200">
              {agents.map((agent: any) => (
                <div key={agent.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-xs text-gray-500">{agent.user?.email}</p>
                    </div>
                    <div className="flex gap-1">
                      <span className={`badge ${
                        agent.status === 'ACTIVE' ? 'badge-success' :
                        agent.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                      }`}>{agent.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{agent.referralCode} · {agent._count?.providerOnboardings || 0} providers</span>
                    <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {agent.status === 'PENDING' && (
                      <>
                        <button onClick={() => updateStatusMutation.mutate({ id: agent.id, status: 'ACTIVE' })}
                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700">Approve</button>
                        <button onClick={() => updateStatusMutation.mutate({ id: agent.id, status: 'INACTIVE' })}
                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700">Reject</button>
                      </>
                    )}
                    {agent.status === 'ACTIVE' && (
                      <button onClick={() => updateStatusMutation.mutate({ id: agent.id, status: 'SUSPENDED' })}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700">Suspend</button>
                    )}
                    {(agent.status === 'SUSPENDED' || agent.status === 'INACTIVE') && (
                      <button onClick={() => updateStatusMutation.mutate({ id: agent.id, status: 'ACTIVE' })}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700">Activate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AdminAgents;
