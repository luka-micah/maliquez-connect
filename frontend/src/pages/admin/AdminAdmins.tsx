import { useState, useCallback } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { adminApi } from '../../api/authApi';
import Pagination from '../../components/common/Pagination';
import { FiSearch, FiAlertCircle, FiPlus, FiToggleLeft, FiToggleRight, FiUserX, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, User, Pagination as PaginationType } from '../../types';

interface AdminFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const initialForm: AdminFormState = { firstName: '', lastName: '', email: '', phone: '' };

const AdminAdmins = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState<AdminFormState>(initialForm);
  const [demoteTarget, setDemoteTarget] = useState<User | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-admins', page, search],
    queryFn: () => adminApi.getAdmins({ page, limit: 10, search: search || undefined }),
  });

  const admins: User[] = data?.data?.data || [];
  const pagination = (data?.data?.pagination || { page: 1 }) as PaginationType;

  const invalidateAdmins = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
  };

  const createMutation = useMutation<any, any, AdminFormState>({
    mutationFn: (body: AdminFormState) => adminApi.createAdmin(body),
    onSuccess: () => {
      invalidateAdmins();
      toast.success('Admin created. Login credentials sent to their email.');
      setModalOpen(false);
      setForm(initialForm);
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to create admin');
    },
  });

  const updateRoleMutation = useMutation<any, any, { id: string; role: 'ADMIN' | 'USER' }>({
    mutationFn: ({ id, role }: { id: string; role: 'ADMIN' | 'USER' }) => adminApi.updateAdminRole(id, role),
    onSuccess: () => {
      invalidateAdmins();
      toast.success('Admin access revoked. User is now a regular account.');
      setDemoteTarget(null);
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to update admin role');
    },
  });

  const updateStatusMutation = useMutation<any, any, { id: string; status: string }>({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      invalidateAdmins();
      toast.success('Admin status updated successfully');
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to update admin status');
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

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error('First name, last name, and email are required');
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim())) {
      toast.error('Invalid email address');
      return;
    }
    createMutation.mutate(form);
  };

  const formatDate = (d: string): string => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Admins</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load admins. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SeoHead title="Admin — Admins" noindex />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <FiPlus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            onChange={handleSearch}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No admins found. Click "Add Admin" to create one.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin: User) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{`${admin.firstName} ${admin.lastName}`}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{admin.email}</td>
                      <td className="px-4 py-3">
                        {admin.role === 'SUPER_ADMIN' ? (
                          <span className="badge badge-danger flex items-center gap-1 w-fit">
                            <FiShield className="w-3 h-3" /> Main Admin
                          </span>
                        ) : (
                          <span className="badge badge-warning">Admin</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${admin.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(admin.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {admin.role === 'SUPER_ADMIN' ? (
                          <span className="text-xs text-gray-400">Main account</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setDemoteTarget(admin)}
                              className="btn-sm flex items-center gap-1 text-red-600 hover:text-red-800"
                            >
                              <FiUserX className="w-4 h-4" /> Revoke
                            </button>
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: admin.id,
                                  status: admin.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              className={`btn-sm flex items-center gap-1 ${
                                admin.status === 'ACTIVE'
                                  ? 'text-red-600 hover:text-red-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {admin.status === 'ACTIVE' ? (
                                <><FiToggleLeft className="w-4 h-4" /> Suspend</>
                              ) : (
                                <><FiToggleRight className="w-4 h-4" /> Activate</>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200">
              {admins.map((admin: User) => (
                <div key={admin.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{`${admin.firstName} ${admin.lastName}`}</h3>
                      <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {admin.role === 'SUPER_ADMIN' ? (
                        <span className="badge badge-danger flex items-center gap-1">
                          <FiShield className="w-3 h-3" /> Main Admin
                        </span>
                      ) : (
                        <span className="badge badge-warning">Admin</span>
                      )}
                      <span className={`badge ${admin.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {admin.status}
                      </span>
                    </div>
                  </div>
                  {admin.role !== 'SUPER_ADMIN' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setDemoteTarget(admin)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <FiUserX className="w-3.5 h-3.5" /> Revoke Admin
                      </button>
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: admin.id,
                            status: admin.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          admin.status === 'ACTIVE'
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {admin.status === 'ACTIVE' ? (
                          <><FiToggleLeft className="w-3.5 h-3.5" /> Suspend</>
                        ) : (
                          <><FiToggleRight className="w-3.5 h-3.5" /> Activate</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Add Admin</h2>
            <p className="text-sm text-gray-500 mb-4">
              A temporary password will be generated and sent to the admin's email address.
            </p>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, firstName: e.target.value })}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, lastName: e.target.value })}
                    className="input-field text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary text-sm">
                  {createMutation.isPending ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {demoteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDemoteTarget(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Revoke Admin Access</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to remove <strong>{demoteTarget.firstName} {demoteTarget.lastName}</strong> as an admin? They will be converted to a regular user account.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDemoteTarget(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => updateRoleMutation.mutate({ id: demoteTarget.id, role: 'USER' })}
                disabled={updateRoleMutation.isPending}
                className="btn-danger"
              >
                {updateRoleMutation.isPending ? 'Revoking...' : 'Revoke Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdmins;
