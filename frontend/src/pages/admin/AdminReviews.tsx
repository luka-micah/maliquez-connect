import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { adminApi, reviewApi } from '../../api/authApi';
import Pagination from '../../components/common/Pagination';
import { FiCheckCircle, FiXCircle, FiStar, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, Review, Pagination as PaginationType } from '../../types';

const statusOptions: string[] = ['', 'PENDING', 'APPROVED', 'REJECTED'];

interface AdminReviewsQueryResult {
  reviews?: Review[];
  pagination?: PaginationType;
}

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminReviews', page, statusFilter],
    queryFn: async () => {
      const res = await (reviewApi as any).getAll({ page, limit: 10, status: statusFilter || undefined });
      return res.data as ApiResponse<AdminReviewsQueryResult>;
    },
  });

  const reviews: Review[] = data?.data?.reviews || [];
  const pagination = (data?.pagination || { page: 1 }) as PaginationType;

  const moderateMutation = useMutation<any, any, { id: string; status: string }>({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.moderateReview(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      toast.success('Review moderated successfully');
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to moderate review');
    },
  });

  const formatDate = (d: string): string => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const renderStars = (rating: number) => (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </span>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Reviews</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load reviews. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Reviews</h1>

      <div className="card p-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field sm:w-48"
        >
          <option value="">All Status</option>
          {statusOptions.slice(1).map((s: string) => (
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
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Listing</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Review</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review: Review) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[160px] truncate">
                      {(review as any).listing?.title || review.listing || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{review.user?.firstName ? `${review.user.firstName} ${review.user.lastName}` : review.user?._id || '—'}</td>
                    <td className="px-4 py-3">{renderStars(review.rating)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[240px] truncate">
                      {review.review || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        review.status === 'APPROVED' ? 'badge-success'
                        : review.status === 'REJECTED' ? 'badge-danger'
                        : 'badge-warning'
                      }`}>
                        {review.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(review.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {review.status !== 'APPROVED' && (
                          <button
                            onClick={() => moderateMutation.mutate({ id: review._id, status: 'APPROVED' })}
                            disabled={moderateMutation.isPending}
                            className="btn-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                          >
                            <FiCheckCircle className="w-4 h-4" /> Approve
                          </button>
                        )}
                        {review.status !== 'REJECTED' && (
                          <button
                            onClick={() => moderateMutation.mutate({ id: review._id, status: 'REJECTED' })}
                            disabled={moderateMutation.isPending}
                            className="btn-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <FiXCircle className="w-4 h-4" /> Reject
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

export default AdminReviews;
