import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { User, ProviderProfile } from '../../types';

interface ProviderSettingsFormData {
  businessName: string;
  businessType: string;
  website: string;
  description: string;
  address: string;
  state: string;
  city: string;
  logo: string;
}

interface AuthContextType {
  user: User | null;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
}

const ProviderSettings = () => {
  const { user, updateProfile } = useAuth() as unknown as AuthContextType;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const profile = (user?.providerProfile || {}) as ProviderProfile & Record<string, string>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProviderSettingsFormData>({
    defaultValues: {
      businessName: profile.businessName || '',
      businessType: profile.businessType || '',
      website: profile.website || '',
      description: profile.description || '',
      address: profile.address || '',
      state: profile.state || '',
      city: profile.city || '',
      logo: profile.logo || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        businessName: profile.businessName || '',
        businessType: profile.businessType || '',
        website: profile.website || '',
        description: profile.description || '',
        address: profile.address || '',
        state: profile.state || '',
        city: profile.city || '',
        logo: profile.logo || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProviderSettingsFormData) => {
    setSubmitting(true);
    try {
      await updateProfile({ providerProfile: data });
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Provider Settings</h1>
        <p className="text-gray-500 mt-1">Update your business profile information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
            <input
              {...register('businessName', { required: 'Business name is required' })}
              className={`w-full px-3 py-2 rounded-lg border ${errors.businessName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
            {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
            <input
              {...register('businessType')}
              placeholder="e.g. Restaurant, Hotel, Clinic"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              {...register('website')}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Tell customers about your business..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              {...register('address')}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                {...register('city')}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                {...register('state')}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Branding</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              {...register('logo')}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {profile.logo && (
            <div className="flex items-center gap-3">
              <img
                src={profile.logo}
                alt="Current logo"
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="text-sm text-gray-500">Current logo</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !isDirty}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSave className="w-5 h-5" />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProviderSettings;
