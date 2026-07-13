import { useState, useCallback } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { adminApi } from '../../api/authApi';
import Pagination from '../../components/common/Pagination';
import { FiSearch, FiToggleLeft, FiToggleRight, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, User, Pagination as PaginationType } from '../../types';

const roleOptions: string[] = ['', 'USER', 'PROVIDER', 'ADMIN'];
const statusOptions: string[] = ['', 'ACTIVE', 'SUSPENDED'];

interface AdminUsersQueryResult {
  users?: User[];
  pagination?: PaginationType;
}

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsers', page, search, roleFilter, statusFilter],
    queryFn: () =>
      adminApi.getUsers({ page, limit: 10, search, role: roleFilter || undefined, status: statusFilter || undefined }),
  });

  const users: User[] = data?.data?.data || [];
  const pagination = (data?.data?.pagination || { page: 1 }) as PaginationType;

  const updateStatusMutation = useMutation<any, any, { id: string; status: string }>({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User status updated successfully');
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to update user status');
    },
  });

  const handleSearch = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setSearch(e.target.value);
          setPage(1);
        }, 400);
      };
    })(),
    [],
  );

  const formatDate = (d: string): string => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load users. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SeoHead title="Admin — Users" noindex />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              onChange={handleSearch}
              className="input-field pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setRoleFilter(e.target.value); setPage(1); }}
            className="input-field sm:w-40"
          >
            <option value="">All Roles</option>
            {roleOptions.slice(1).map((r: string) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field sm:w-40"
          >
            <option value="">All Status</option>
            {statusOptions.slice(1).map((s: string) => (
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
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : user.role === 'PROVIDER' ? 'badge-warning' : 'badge-info'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${user.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: user.id,
                              status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className={`btn-sm flex items-center gap-1 ml-auto ${
                            user.status === 'ACTIVE'
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? (
                            <><FiToggleLeft className="w-4 h-4" /> Suspend</>
                          ) : (
                            <><FiToggleRight className="w-4 h-4" /> Activate</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {users.map((user: User) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{`${user.firstName} ${user.lastName}`}</h3>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : user.role === 'PROVIDER' ? 'badge-warning' : 'badge-info'}`}>
                        {user.role}
                      </span>
                      <span className={`badge ${user.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: user.id,
                          status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        user.status === 'ACTIVE'
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? (
                        <><FiToggleLeft className="w-3.5 h-3.5" /> Suspend</>
                      ) : (
                        <><FiToggleRight className="w-3.5 h-3.5" /> Activate</>
                      )}
                    </button>
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

export default AdminUsers;
