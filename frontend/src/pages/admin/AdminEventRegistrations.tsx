import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { eventRegistrationApi } from '../../api/authApi';
import { FiCalendar, FiMail, FiPhone, FiUser, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { ApiResponse, EventRegistration } from '../../types';

const AdminEventRegistrations = () => {
  const [filterEventId, setFilterEventId] = useState<string>('');
  const [page, setPage] = useState(1);

  const queryKey = filterEventId
    ? ['event-registrations', filterEventId, page]
    : ['event-registrations', 'all', page];

  const queryFn = filterEventId
    ? () => eventRegistrationApi.getByEvent(filterEventId, { page: String(page), limit: '20' })
    : () => eventRegistrationApi.getAll({ page: String(page), limit: '20' });

  const { data, isLoading, error } = useQuery<AxiosResponse<ApiResponse<EventRegistration[]>>>({
    queryKey,
    queryFn,
  });

  const registrations: EventRegistration[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const exportCsv = () => {
    const header = 'Name,Email,Phone,Event,Registered At\n';
    const rows = registrations.map((r) =>
      `"${r.firstName} ${r.lastName}","${r.email}","${r.phone || ''}","${r.event?.title || ''}","${new Date(r.createdAt).toLocaleString()}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SeoHead title="Admin — Event Registrations" noindex />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Event Registrations</h1>
        <button onClick={exportCsv} className="btn-secondary flex items-center gap-2 text-sm">
          <FiDownload className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="card overflow-hidden">
        {error && (
          <div className="p-8 text-center">
            <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600">Failed to load registrations.</p>
          </div>
        )}

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No registrations yet.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <FiUser className="w-4 h-4 text-gray-400" />
                          {reg.firstName} {reg.lastName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          {reg.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          {reg.phone || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                        {reg.event?.title || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200">
              {registrations.map((reg) => (
                <div key={reg.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <FiUser className="w-4 h-4 text-gray-400" />
                    {reg.firstName} {reg.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    {reg.email}
                  </div>
                  {reg.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      {reg.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    {reg.event?.title || '—'}
                  </div>
                  <p className="text-xs text-gray-400">
                    Registered {new Date(reg.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="btn-sm btn-secondary text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="btn-sm btn-secondary text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventRegistrations;
