import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import SeoHead from '../../components/seo/SeoHead';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { LoginInput } from '../../types';

interface LoginFormData {
  email: string;
  password: string;
}

interface LocationState {
  from?: {
    pathname: string;
  };
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const from = (location.state as LocationState)?.from?.pathname || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      const response = await login(data as unknown as LoginInput);
      const role = response.data.user.role;

      if (role !== 'ADMIN') {
        toast.error('Access denied. Admin credentials required.');
        setSubmitting(false);
        return;
      }

      toast.success('Welcome back, Admin!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr.response?.data?.message || 'Invalid admin credentials';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-900">
      <SeoHead
        title="Admin Sign In"
        description="Admin sign in for Maliquez Connect"
        canonical="/admin/login"
        noindex
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600/20 mb-4">
            <FiShield className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 mt-2">Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-xl p-8 space-y-5 border border-gray-700">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border bg-gray-700 text-white placeholder-gray-400 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-primary-500'
                } focus:border-transparent focus:outline-none focus:ring-2`}
                placeholder="admin@maliquez.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                className={`w-full pl-11 pr-12 py-3 rounded-lg border bg-gray-700 text-white placeholder-gray-400 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-primary-500'
                } focus:border-transparent focus:outline-none focus:ring-2`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Authenticating...' : 'Sign In to Admin'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          <a href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Back to user sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
