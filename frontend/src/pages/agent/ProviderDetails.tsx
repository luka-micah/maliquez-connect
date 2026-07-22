import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../../api/agentApi';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMail, FiClock, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';

const STATUS_COLORS: Record<string, string> = {
  PROSPECT: 'bg-gray-100 text-gray-700', CONTACTED: 'bg-blue-100 text-blue-700',
  INTERESTED: 'bg-indigo-100 text-indigo-700', REGISTERED: 'bg-cyan-100 text-cyan-700',
  INVITED: 'bg-purple-100 text-purple-700', ACCOUNT_CLAIMED: 'bg-teal-100 text-teal-700',
  PROFILE_COMPLETED: 'bg-emerald-100 text-emerald-700', DOCUMENTS_SUBMITTED: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700', APPROVED: 'bg-green-100 text-green-700',
  PUBLISHED: 'bg-green-200 text-green-800', REJECTED: 'bg-red-100 text-red-700',
};

const ACTIVITY_ICONS: Record<string, string> = {
  PHONE_CALL: '📞', WHATSAPP: '💬', SMS: '📱', EMAIL: '📧',
  OFFICE_VISIT: '🏢', MEETING: '🤝', FOLLOW_UP: '🔄', OTHER: '📝',
};

const ProviderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityData, setActivityData] = useState({ activityType: 'OTHER', note: '', nextFollowUp: '' });

  const { data: provider, isLoading } = useQuery({
    queryKey: ['agent-provider', id],
    queryFn: async () => {
      const res = await agentApi.getProvider(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  const inviteMutation = useMutation({
    mutationFn: () => agentApi.sendInvitation(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-provider', id] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
      toast.success('Invitation sent');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resendMutation = useMutation({
    mutationFn: () => agentApi.resendInvitation(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-provider', id] });
      queryClient.invalidateQueries({ queryKey: ['agent-dashboard'] });
      toast.success('Invitation resent');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const activityMutation = useMutation({
    mutationFn: (data: any) => agentApi.createFollowUp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-provider', id] });
      toast.success('Activity logged');
      setShowActivityForm(false);
      setActivityData({ activityType: 'OTHER', note: '', nextFollowUp: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!provider) {
    return <div className="text-center py-12 text-gray-500">Provider not found</div>;
  }

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    activityMutation.mutate({
      providerId: provider.id,
      ...activityData,
      nextFollowUp: activityData.nextFollowUp || undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/agent/providers" className="text-gray-400 hover:text-gray-600">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{provider.businessName}</h1>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[provider.onboardingStatus] || 'bg-gray-100 text-gray-700'}`}>
          {provider.onboardingStatus.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Business Name</dt><dd className="font-medium text-gray-900">{provider.businessName}</dd></div>
              <div><dt className="text-gray-500">Category</dt><dd className="font-medium text-gray-900">{provider.category || '—'}</dd></div>
              <div><dt className="text-gray-500">Sector</dt><dd className="font-medium text-gray-900">{provider.sector || '—'}</dd></div>
              <div><dt className="text-gray-500">Contact Person</dt><dd className="font-medium text-gray-900">{provider.contactPerson}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-900">{provider.phoneNumber}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-900">{provider.email}</dd></div>
              {provider.whatsappNumber && <div><dt className="text-gray-500">WhatsApp</dt><dd className="font-medium text-gray-900">{provider.whatsappNumber}</dd></div>}
              {provider.website && <div><dt className="text-gray-500">Website</dt><dd className="font-medium text-gray-900">{provider.website}</dd></div>}
              {provider.address && <div className="col-span-2"><dt className="text-gray-500">Address</dt><dd className="font-medium text-gray-900">{provider.address}</dd></div>}
              {provider.description && <div className="col-span-2"><dt className="text-gray-500">Description</dt><dd className="font-medium text-gray-900">{provider.description}</dd></div>}
            </dl>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
              <button onClick={() => setShowActivityForm(!showActivityForm)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                {showActivityForm ? 'Cancel' : '+ Log Activity'}
              </button>
            </div>

            {showActivityForm && (
              <form onSubmit={handleActivitySubmit} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <select value={activityData.activityType} onChange={(e) => setActivityData(prev => ({ ...prev, activityType: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">Email</option>
                    <option value="OFFICE_VISIT">Office Visit</option>
                    <option value="MEETING">Meeting</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={activityData.note} onChange={(e) => setActivityData(prev => ({ ...prev, note: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
                  <input type="datetime-local" value={activityData.nextFollowUp} onChange={(e) => setActivityData(prev => ({ ...prev, nextFollowUp: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <button type="submit" disabled={activityMutation.isPending} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-500 disabled:opacity-50">
                  {activityMutation.isPending ? 'Saving...' : 'Save Activity'}
                </button>
              </form>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {provider.outreachActivities?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No activities recorded yet</p>
              )}
              {provider.outreachActivities?.map((activity: any) => (
                <div key={activity.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{ACTIVITY_ICONS[activity.activityType] || '📝'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">{activity.activityType.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleString()}</span>
                    </div>
                    {activity.note && <p className="text-sm text-gray-700 mt-1">{activity.note}</p>}
                    {activity.nextFollowUp && (
                      <p className="text-xs text-primary-600 mt-1">
                        <FiClock className="inline w-3 h-3 mr-1" />
                        Next: {new Date(activity.nextFollowUp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {provider.documents && provider.documents.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-2">
                {provider.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.documentType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">{doc.fileName || 'No filename'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
                      doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>{doc.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
            <div className="space-y-2">
              {provider.onboardingStatus === 'REGISTERED' && (
                <button onClick={() => inviteMutation.mutate()} className="w-full flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 text-sm font-medium">
                  <FiMail className="w-4 h-4" /> Send Invitation
                </button>
              )}
              {provider.onboardingStatus === 'INVITED' && (
                <button onClick={() => resendMutation.mutate()} className="w-full flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 text-sm font-medium">
                  <FiMail className="w-4 h-4" /> Resend Invitation
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-3">
              {[
                { label: 'Created', value: provider.createdAt },
                { label: 'Invited', value: provider.invitedAt },
                { label: 'Claimed', value: provider.claimedAt },
                { label: 'Approved', value: provider.approvedAt },
              ].filter(t => t.value).map(t => (
                <div key={t.label} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-400" />
                  <span className="text-gray-500">{t.label}:</span>
                  <span className="text-gray-900">{new Date(t.value!).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails;
