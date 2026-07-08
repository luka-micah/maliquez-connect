import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { adminApi } from '../../api/authApi';
import Pagination from '../../components/common/Pagination';
import { FiEye, FiAlertCircle } from 'react-icons/fi';
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminProviders', page, verificationFilter],
    queryFn: () =>
      adminApi.getProviders({ page, limit: 10, verificationStatus: verificationFilter || undefined }),
  });

  const providers = (data?.data?.data || []) as ProviderListItem[];
  const pagination = (data?.data?.pagination || { page: 1 }) as PaginationType;

  const formatDate = (d: string): string => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

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
          <div className="overflow-x-auto">
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
                      <span className={`badge ${
                        provider.verificationStatus === 'VERIFIED' ? 'badge-success'
                        : provider.verificationStatus === 'REJECTED' ? 'badge-danger'
                        : 'badge-warning'
                      }`}>
                        {provider.verificationStatus || 'PENDING'}
                      </span>
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
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AdminProviders;
