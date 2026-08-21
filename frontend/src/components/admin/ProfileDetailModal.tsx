import { useEffect, useState } from 'react';
import { FiX, FiMail, FiPhone, FiMapPin, FiCalendar, FiStar, FiUser, FiShield, FiBriefcase, FiActivity } from 'react-icons/fi';
import { adminApi } from '../../api/authApi';
import type { User as UserType, Listing, Review, AgentProfile, ProviderOnboarding } from '../../types';

interface ProfileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'user' | 'provider' | 'agent';
  id: string;
}

const ProfileDetailModal = ({ isOpen, onClose, type, id }: ProfileDetailModalProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (isOpen && id) {
      fetchProfile();
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, id, type]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (type === 'user') {
        response = await adminApi.getUserById(id);
      } else if (type === 'provider') {
        response = await adminApi.getProviderById(id);
      } else {
        response = await adminApi.getAgentById(id);
      }
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      VERIFIED: 'bg-blue-100 text-blue-800',
      UNVERIFIED: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderUserProfile = () => {
    if (!data) return null;
    const user = data as UserType & { _count: any; listings?: Listing[]; recentReviews?: Review[] };
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
            ) : (
              <FiUser className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                {user.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.role)}`}>
                {user.role}
              </span>
              {user.isVerified && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                  <FiShield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Phone</label>
            <p className="flex items-center gap-2 text-gray-900">
              <FiPhone className="w-4 h-4 text-gray-400" />
              {user.phone || 'Not provided'}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Joined</label>
            <p className="flex items-center gap-2 text-gray-900">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              {formatDate(user.createdAt)}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Listings</label>
            <p className="text-gray-900 font-medium">{user._count?.listings || 0}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Reviews</label>
            <p className="text-gray-900 font-medium">{user._count?.reviews || 0}</p>
          </div>
        </div>

        {type === 'provider' && user.providerProfile && (
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Provider Profile</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(user.providerProfile).map(([key, value]) => (
                value && <div key={key} className="flex justify-between">
                  <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'listings' && user.listings && (
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Listings ({user.listings.length})</h4>
            <div className="space-y-2">
              {user.listings.map((listing: Listing) => (
                <div key={listing.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{listing.title}</p>
                    <p className="text-sm text-gray-500">
                      {typeof listing.category === 'object' && listing.category ? listing.category.name : 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${listing.status === 'APPROVED' ? 'badge-success' : listing.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                      {listing.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{listing.averageRating.toFixed(1)} <FiStar className="w-3 h-3 inline" /> ({listing.reviewCount})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && user.recentReviews && (
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Reviews ({user.recentReviews.length})</h4>
            <div className="space-y-2">
              {user.recentReviews.map((review: Review) => (
                <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Listing ID: {review.listing}</p>
                      <p className="text-sm text-gray-500">{review.review || 'No comment'}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{review.rating}</span>
                      </div>
                      <span className={`badge ${review.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                        {review.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAgentProfile = () => {
    if (!data) return null;
    const agent = data as AgentProfile & { recentOnboardings: ProviderOnboarding[]; recentActivities: any[] };
    const user = agent.user;
    if (!user) return <div>Agent user data not available</div>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
            ) : (
              <FiBriefcase className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(agent.status)}`}>
                Agent: {agent.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status || 'ACTIVE')}`}>
                User: {user.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Referral Code</label>
            <p className="font-mono text-gray-900">{agent.referralCode}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Phone</label>
            <p className="flex items-center gap-2 text-gray-900">
              <FiPhone className="w-4 h-4 text-gray-400" />
              {agent.phone || 'Not provided'}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Assigned State</label>
            <p className="flex items-center gap-2 text-gray-900">
              <FiMapPin className="w-4 h-4 text-gray-400" />
              {agent.assignedState || 'Not assigned'}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Assigned LGA</label>
            <p className="text-gray-900">{agent.assignedLGA || 'Not assigned'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Providers Managed</label>
            <p className="text-gray-900 font-medium">{agent._count?.providerOnboardings || 0}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Activities</label>
            <p className="text-gray-900 font-medium">{agent.recentActivities?.length || 0}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Joined</label>
            <p className="flex items-center gap-2 text-gray-900">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              {formatDate(user.createdAt || '')}
            </p>
          </div>
        </div>

        {activeTab === 'onboardings' && agent.recentOnboardings && (
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Onboardings ({agent.recentOnboardings.length})</h4>
            <div className="space-y-2">
              {agent.recentOnboardings.map((onboarding: ProviderOnboarding) => (
                <div key={onboarding.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{onboarding.businessName}</p>
                    <p className="text-sm text-gray-500">{onboarding.provider?.firstName} {onboarding.provider?.lastName} - {onboarding.provider?.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      onboarding.onboardingStatus === 'APPROVED' || onboarding.onboardingStatus === 'PUBLISHED' ? 'badge-success' :
                      onboarding.onboardingStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {onboarding.onboardingStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activities' && agent.recentActivities && (
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Activities ({agent.recentActivities.length})</h4>
            <div className="space-y-2">
              {agent.recentActivities.map((activity: any) => (
                <div key={activity.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{activity.activityType.toLowerCase().replace('_', ' ')}</p>
                    <p className="text-sm text-gray-500">{activity.note || 'No notes'}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{formatDate(activity.createdAt)}</p>
                    {activity.nextFollowUp && (
                      <p className="text-orange-600">Follow-up: {formatDate(activity.nextFollowUp)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs = type === 'agent'
    ? [
        { id: 'profile', label: 'Profile' },
        { id: 'onboardings', label: 'Onboardings' },
        { id: 'activities', label: 'Activities' },
      ]
    : [
        { id: 'profile', label: 'Profile' },
        { id: 'listings', label: 'Listings' },
        { id: 'reviews', label: 'Reviews' },
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              {type === 'user' ? 'User Profile' : type === 'provider' ? 'Provider Profile' : 'Agent Profile'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-200 p-4 sticky top-[56px] bg-white">
                <nav className="flex gap-4 overflow-x-auto" aria-label="Profile tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {type === 'agent' ? renderAgentProfile() : renderUserProfile()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailModal;