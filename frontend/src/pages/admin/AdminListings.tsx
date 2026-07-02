import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { adminApi } from '../../api/authApi';
import Pagination from '../../components/common/Pagination';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, Listing, Pagination as PaginationType } from '../../types';

const tabs: { key: string; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'SUSPENDED', label: 'Suspended' },
];

const sectors: string[] = ['', 'EDUCATION', 'HEALTHCARE', 'HOSPITALITY', 'LOGISTICS'];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: 'badge-success',
    PENDING: 'badge-warning',
    SUSPENDED: 'badge-danger',
    REJECTED: 'badge-danger',
  };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
};

interface AdminListingsQueryResult {
  listings?: Listing[];
  pagination?: PaginationType;
}

const AdminListings = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [statusTab, setStatusTab] = useState<string>('');
  const [sector, setSector] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminListings', page, statusTab, sector],
    queryFn: () =>
      adminApi.getListings({ page, limit: 10, status: statusTab || undefined, sector: sector || undefined }),
  });

  const listings: Listing[] = data?.data?.data || [];
  const pagination = (data?.data?.pagination || { page: 1 }) as PaginationType;

  const approveMutation = useMutation<any, any, string>({
    mutationFn: (id: string) => adminApi.approveListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminListings'] });
      toast.success('Listing approved successfully');
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to approve listing');
    },
  });

  const suspendMutation = useMutation<any, any, string>({
    mutationFn: (id: string) => adminApi.suspendListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminListings'] });
      toast.success('Listing suspended successfully');
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to suspend listing');
    },
  });

  const formatDate = (d: string): string => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Listings</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load listings. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Listings</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setStatusTab(key); setPage(1); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusTab === key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={sector}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSector(e.target.value); setPage(1); }}
          className="input-field sm:w-44"
        >
          <option value="">All Sectors</option>
          {sectors.slice(1).map((s: string) => (
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
        ) : listings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No listings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listings.map((listing: Listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                      {listing.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{typeof listing.category === 'object' ? listing.category?.name : listing.category || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{typeof listing.owner === 'object' ? `${listing.owner?.firstName} ${listing.owner?.lastName}` : listing.owner || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(listing.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiStar className="w-3.5 h-3.5 text-yellow-400" />
                        {listing.averageRating?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(listing.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {listing.status === 'PENDING' && (
                          <button
                            onClick={() => approveMutation.mutate(listing.id)}
                            disabled={approveMutation.isPending}
                            className="btn-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                          >
                            <FiCheckCircle className="w-4 h-4" /> Approve
                          </button>
                        )}
                        {listing.status !== 'SUSPENDED' && (
                          <button
                            onClick={() => suspendMutation.mutate(listing.id)}
                            disabled={suspendMutation.isPending}
                            className="btn-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <FiXCircle className="w-4 h-4" /> Suspend
                          </button>
                        )}
                      </div>
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

export default AdminListings;
