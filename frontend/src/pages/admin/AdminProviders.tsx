import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { adminApi } from '../../api/authApi';
import Pagination from '../../components/common/Pagination';
import { FiEye, FiAlertCircle, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { ApiResponse, User, Pagination as PaginationType } from '../../types';

const verificationOptions: string[] = ['', 'PENDING', 'VERIFIED', 'REJECTED'];

interface ProviderListItem {
  id: string;
  businessName?: string;
  name?: string;
  email: string;
  verificationStatus?: string;
  createdAt: string;
}

interface AdminProvidersQueryResult {
  providers?: ProviderListItem[];
  pagination?: PaginationType;
}

const AdminProviders = () => {
  const [page, setPage] = useState<number>(1);
  const [verificationFilter, setVerificationFilter] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminProviders', page, verificationFilter],
    queryFn: () =>
      adminApi.getProviders({ page, limit: 10, verificationStatus: verificationFilter || undefined }),
  });

  const verificationMutation = useMutation({
    mutationFn: ({ providerId, status }: { providerId: string; status: string }) =>
      adminApi.verifyProvider(providerId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProviders'] });
      setIsModalOpen(false);
      setSelectedProviderId(null);
      setSelectedStatus('');
    },
    onError: (error) => {
      console.error('Failed to update provider verification:', error);
    },
  });

  const rawProviders = (data?.data?.data || []) as any[];
  const providers = rawProviders.map((provider) => ({
    id: provider.id,
    businessName: provider.providerProfile?.businessName,
    name: `${provider.firstName} ${provider.lastName}`,
    email: provider.email,
    verificationStatus: provider.providerProfile?.verificationStatus,
    createdAt: provider.createdAt,
  })) as ProviderListItem[];
  const pagination = (data?.data?.pagination || { page: 1 }) as PaginationType;


  const formatDate = (d: string): string => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleVerificationClick = (providerId: string, currentStatus: string) => {
    setSelectedProviderId(providerId);
    setSelectedStatus(currentStatus || 'PENDING');
    setIsModalOpen(true);
  };

  const handleConfirmVerification = () => {
    if (selectedProviderId && selectedStatus) {
      verificationMutation.mutate({ providerId: selectedProviderId, status: selectedStatus });
    }
  };

  const getVerificationIcon = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return <FiCheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED':
        return <FiXCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FiClock className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Providers</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load providers. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SeoHead title="Admin — Providers" noindex />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Providers</h1>

      <div className="card p-4 mb-6">
        <select
          value={verificationFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setVerificationFilter(e.target.value); setPage(1); }}
          className="input-field sm:w-48"
        >
          <option value="">All Verification Status</option>
          {verificationOptions.slice(1).map((s: string) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No providers found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Business Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Owner Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Verification</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {providers.map((provider: ProviderListItem) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{provider.businessName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{provider.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{provider.email}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleVerificationClick(provider.id, provider.verificationStatus || '')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            provider.verificationStatus === 'VERIFIED' ? 'badge badge-success'
                            : provider.verificationStatus === 'REJECTED' ? 'badge badge-danger'
                            : 'badge badge-warning'
                          } hover:opacity-80 cursor-pointer`}
                        >
                          {getVerificationIcon(provider.verificationStatus)}
                          {provider.verificationStatus || 'PENDING'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(provider.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/providers/analytics/${provider.id}`}
                          className="btn-sm inline-flex items-center gap-1 text-primary-600 hover:text-primary-800"
                        >
                          <FiEye className="w-4 h-4" /> View Analytics
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {providers.map((provider: ProviderListItem) => (
                <div key={provider.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{provider.businessName || '—'}</p>
                      <p className="text-xs text-gray-500">{provider.name}</p>
                    </div>
                    <button
                      onClick={() => handleVerificationClick(provider.id, provider.verificationStatus || '')}
                      className={`badge flex-shrink-0 inline-flex items-center gap-1 ${
                        provider.verificationStatus === 'VERIFIED' ? 'badge-success'
                        : provider.verificationStatus === 'REJECTED' ? 'badge-danger'
                        : 'badge-warning'
                      } cursor-pointer hover:opacity-80`}
                    >
                      {getVerificationIcon(provider.verificationStatus)}
                      {provider.verificationStatus || 'PENDING'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{provider.email}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-400">{formatDate(provider.createdAt)}</span>
                    <Link
                      to={`/admin/providers/analytics/${provider.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      <FiEye className="w-3.5 h-3.5" /> View Analytics
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Verification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Verification Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field w-full"
                >
                  {verificationOptions.slice(1).map((status: string) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedProviderId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={verificationMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerification}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                disabled={verificationMutation.isPending}
              >
                {verificationMutation.isPending ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviders;
