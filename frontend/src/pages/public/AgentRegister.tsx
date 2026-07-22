import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiCheck } from 'react-icons/fi';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const AgentRegister = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    assignedState: '', assignedLGA: '',
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.post('/auth/register-agent', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        assignedState: data.assignedState || undefined,
        assignedLGA: data.assignedLGA || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Registration submitted! An administrator will review your application.');
      setStep(3);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        toast.error('Invalid email address');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    registerMutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Become an Agent</h1>
          <p className="text-gray-500 mt-2">Join Maliquez Connect as a registered agent</p>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="text-sm font-medium text-gray-700">Personal Information</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={form.firstName} onChange={e => updateField('firstName', e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="John" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input value={form.lastName} onChange={e => updateField('lastName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.phone} onChange={e => updateField('phone', e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="+234 800 000 0000" />
                </div>
              </div>
            </div>

            <button onClick={handleNext} className="w-full mt-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500">
              Continue
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already an agent? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign In</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-sm font-medium text-gray-700">Account Setup</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned State</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={form.assignedState} onChange={e => updateField('assignedState', e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white">
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned LGA</label>
                <input value={form.assignedLGA} onChange={e => updateField('assignedLGA', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Local Government Area" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="At least 6 characters" minLength={6} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Repeat password" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                Back
              </button>
              <button type="submit" disabled={registerMutation.isPending} className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500 disabled:opacity-50">
                {registerMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-500 mb-6">
              Thank you for registering as an agent. Our team will review your application and you'll receive an email once your account is activated.
            </p>
            <Link to="/login" className="inline-block px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500">
              Go to Login
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          By registering, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a> and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default AgentRegister;
