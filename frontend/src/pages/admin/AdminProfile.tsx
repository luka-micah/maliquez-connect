import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiShield, FiCalendar, FiCamera, FiLock, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { User } from '../../types';

interface ProfileFormState {
  firstName: string;
  lastName: string;
  phone: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AdminProfile = () => {
  const { user, updateProfile, changePassword, updateAvatar } = useAuth();
  const [form, setForm] = useState<ProfileFormState>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim() || undefined });
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Current and new password are required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully. Please sign in again on other devices.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarSelect = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit');
      return;
    }
    setUploadingAvatar(true);
    try {
      await updateAvatar(file);
      toast.success('Avatar updated successfully');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A';

  return (
    <div className="max-w-3xl">
      <SeoHead title="Admin — Profile" noindex />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
              ) : (
                <FiUser className="w-10 h-10 text-primary-600" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border border-gray-300 text-gray-500 hover:text-gray-700 shadow-sm cursor-pointer">
              <FiCamera className="w-4 h-4" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadingAvatar}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleAvatarSelect(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{`${user.firstName} ${user.lastName}`}</h2>
            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <FiMail className="w-4 h-4" /> {user.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className={`badge ${user.role === 'SUPER_ADMIN' ? 'badge-danger' : 'badge-warning'}`}>
                {user.role === 'SUPER_ADMIN' ? 'Main Admin' : 'Admin'}
              </span>
              <span className={`badge ${user.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{user.status}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 mt-5 pt-5 border-t border-gray-100">
          <FiCalendar className="w-4 h-4" />
          <span>Member since {memberSince}</span>
        </div>
        {uploadingAvatar && <p className="text-xs text-primary-600 mt-2">Uploading avatar...</p>}
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiUser className="w-4 h-4 text-primary-600" /> Personal Information
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1"><FiPhone className="w-3 h-3" /> Phone</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: e.target.value })}
              className="input-field text-sm"
              placeholder="+234 800 000 0000"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary text-sm flex items-center gap-2">
              <FiSave className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiLock className="w-4 h-4 text-primary-600" /> Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Current Password *</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input-field text-sm"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">New Password *</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input-field text-sm"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input-field text-sm"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword} className="btn-primary text-sm flex items-center gap-2">
              <FiSave className="w-4 h-4" /> {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
