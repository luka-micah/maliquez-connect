import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../../api/agentApi';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiMail, FiEye } from 'react-icons/fi';

const STATUS_OPTIONS = [
  'ALL', 'PROSPECT', 'CONTACTED', 'INTERESTED', 'REGISTERED',
  'INVITED', 'ACCOUNT_CLAIMED', 'PROFILE_COMPLETED',
  'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED',
  'REJECTED',
];

const ProviderManagement = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(searchParams.get('action') === 'create');

  const [formData, setFormData] = useState({
    businessName: '', category: '', sector: '', contactPerson: '',
    phoneNumber: '', email: '', whatsappNumber: '', address: '',
    state: '', lga: '', description: '', website: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['agent-providers', page, statusFilter, search],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;
      const res = await agentApi.getProviders(params);
      return { providers: res.data.data, pagination: res.data.pagination };
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => agentApi.createProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-providers'] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
      toast.success('Provider registered successfully');
      setShowCreate(false);
      setFormData({ businessName: '', category: '', sector: '', contactPerson: '', phoneNumber: '', email: '', whatsappNumber: '', address: '', state: '', lga: '', description: '', website: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to register'),
  });

  const inviteMutation = useMutation({
    mutationFn: (id: string) => agentApi.sendInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-providers'] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
      toast.success('Invitation sent');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send invitation'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.contactPerson || !formData.phoneNumber || !formData.email) {
      toast.error('Business name, contact person, phone, and email are required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 text-sm font-medium"
        >
          <FiPlus className="w-4 h-4" />
          {showCreate ? 'Cancel' : 'Register Provider'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Provider</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
              <select name="sector" value={formData.sector} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Select</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
              <input name="lga" value={formData.lga} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input name="website" value={formData.website} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 text-sm font-medium disabled:opacity-50">
              {createMutation.isPending ? 'Registering...' : 'Register Provider'}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search providers..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-60"
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.providers?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.businessName}</p>
                      {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.contactPerson}</td>
                    <td className="px-4 py-3 text-gray-600">{p.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        ['APPROVED', 'PUBLISHED'].includes(p.onboardingStatus) ? 'bg-green-100 text-green-700' :
                        p.onboardingStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        p.onboardingStatus === 'INVITED' ? 'bg-purple-100 text-purple-700' :
                        p.onboardingStatus === 'UNDER_REVIEW' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {p.onboardingStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {p.onboardingStatus === 'REGISTERED' && (
                          <button
                            onClick={() => inviteMutation.mutate(p.id)}
                            className="p-1.5 text-gray-500 hover:text-primary-600"
                            title="Send Invitation"
                          >
                            <FiMail className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`/agent/providers/${p.id}`}
                          className="p-1.5 text-gray-500 hover:text-primary-600"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.pagination.hasPrevPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.pagination.hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderManagement;
