import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '../../types';

const ProviderClaim = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const claimMutation = useMutation({
    mutationFn: async (data: { token: string; password: string; firstName: string; lastName: string }) => {
      const res = await api.post('/provider/claim', data) as AxiosResponse<ApiResponse<any>>;
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Account claimed successfully! Please log in.');
      navigate('/login');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to claim account');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid invitation link');
      return;
    }
    if (!firstName || !lastName) {
      toast.error('First and last name are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    claimMutation.mutate({ token, password, firstName, lastName });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-500 mb-4">This invitation link is invalid or has expired.</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Claim Your Account</h1>
          <p className="text-gray-500 mt-2">Create your account to manage your business listing</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={claimMutation.isPending}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500 disabled:opacity-50"
          >
            {claimMutation.isPending ? 'Creating Account...' : 'Claim Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProviderClaim;
