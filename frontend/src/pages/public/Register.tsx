import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import SeoHead from '../../components/seo/SeoHead';
import type { RegisterInput } from '../../types';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['USER', 'PROVIDER']),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the Terms and Conditions and Privacy Policy'),
  subscribedToNewsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).superRefine((data, ctx) => {
  if (data.role === 'PROVIDER') {
    if (!data.businessName || data.businessName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business name is required',
        path: ['businessName'],
      });
    }
    if (!data.businessType || data.businessType.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business type is required',
        path: ['businessType'],
      });
    }
  }
});

type RegisterFormData = z.infer<typeof registerSchema>;

const termsText = `Terms and Conditions for Maliquez Connect
Last Updated: 1st June 2026

Welcome to Maliquez Connect. These Terms and Conditions ("Terms") govern your use of the Maliquez Connect mobile application and related services. By accessing or using our platform, you agree to these Terms.

1. About Maliquez Connect

Maliquez Connect is an information and discovery platform that connects users with service providers, including but not limited to schools, hospitals, hotels, restaurants, and other registered businesses. Our goal is to help users make informed decisions through reviews, ratings, and business information.

2. Acceptance of Terms

By creating an account or using Maliquez Connect, you confirm that you have read, understood, and agreed to these Terms. If you do not agree, please do not use the platform.

3. User Accounts

Users agree to:

- Provide accurate and current information during registration.
- Keep login credentials secure.
- Be responsible for all activities carried out under their account.
- Notify us immediately of any unauthorized use of their account.

4. Business Registration

Businesses registering on Maliquez Connect agree to:

- Provide truthful and accurate business information.
- Keep their information updated.
- Ensure they have the legal authority to represent their business.
- Not post misleading, fraudulent, or false information.

Maliquez Connect reserves the right to remove or suspend business listings that violate these Terms.

5. Reviews and Ratings

Users may post reviews and ratings based on genuine experiences. Reviews must:

- Be honest and factual.
- Not contain abusive, defamatory, hateful, discriminatory, or offensive language.
- Not include false accusations or misleading information.
- Not promote illegal activities.

Maliquez Connect reserves the right to remove reviews that violate these guidelines.

6. Information Accuracy

We strive to provide accurate information. However:

- Business information is provided by registered businesses or users.
- We do not guarantee that all information is complete, current, or accurate.
- Users should independently verify important information before making decisions.

7. Prohibited Use

Users may not:

- Use the platform for illegal purposes.
- Impersonate another person or business.
- Upload harmful software or malicious code.
- Attempt unauthorized access to our systems.
- Manipulate ratings or reviews.
- Harass or threaten other users.

8. Intellectual Property

All content, logos, trademarks, software, and designs associated with Maliquez Connect are owned by or licensed to Maliquez Connect. Users may not copy, modify, distribute, or reproduce our content without written permission.

9. Privacy

Your use of Maliquez Connect is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.

10. Third-Party Services

Maliquez Connect may include links to third-party websites or services. We are not responsible for the content, products, services, or privacy practices of those third parties.

11. Disclaimer

Maliquez Connect provides information to assist users in making informed decisions. We do not:

- Guarantee the quality or availability of services provided by listed businesses.
- Endorse every business listed on the platform.
- Accept responsibility for disputes between users and businesses.

Users interact with businesses at their own risk.

12. Limitation of Liability

To the fullest extent permitted by law, Maliquez Connect shall not be liable for any direct, indirect, incidental, or consequential damages resulting from use of the platform, reliance on information provided, or interactions between users and businesses.

13. Account Suspension or Termination

We reserve the right to suspend or terminate any account that violates these Terms, engages in fraudulent or harmful activities, or misuses the platform.

14. Changes to These Terms

We may update these Terms from time to time. Continued use of the platform after changes are published constitutes acceptance of the revised Terms.

15. Governing Law

These Terms shall be governed by and interpreted in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles.

16. Contact Us

If you have questions regarding these Terms, please contact us:

Maliquez Connect
Email: info@maliquez.com
Phone: 07032495905
Address: 112 Ebitu Ukiwe street, Jabi, Abuja.`;

const privacyText = `Privacy Policy for Maliquez Connect
Effective Date: 1st July 2026
Last Updated: 29th June 2026

Maliquez Connect ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Maliquez Connect mobile application and related services.

By using Maliquez Connect, you agree to the collection and use of information in accordance with this Privacy Policy.

1. Information We Collect

We may collect the following types of information:

Personal Information

When you register or use our services, we may collect: Full name, Email address, Phone number, Profile photo (optional), Business information (for registered businesses).

Usage Information

We may automatically collect: Device type, Operating system, App version, IP address, Device identifiers, Date and time of access, Features used within the app.

Location Information

With your permission, we may collect your location to help you discover nearby schools, hospitals, hotels, restaurants, and other businesses. You can disable location access at any time through your device settings.

Reviews and User Content

Any reviews, ratings, comments, photos, or other content you post may be publicly visible to other users.

2. How We Use Your Information

We use your information to: Create and manage your account, Display your profile and business listings, Help users discover nearby businesses and services, Improve our services and user experience, Respond to customer support requests, Send important notifications about your account, Prevent fraud, abuse, and unauthorized access, Comply with legal obligations.

3. Sharing Your Information

We do not sell your personal information. We may share your information: With businesses when necessary to provide services you request, With trusted service providers who help us operate the app, When required by law or legal process, To protect the rights, safety, or security of Maliquez Connect, our users, or others.

4. Cookies and Similar Technologies

Our app may use cookies or similar technologies to: Remember your preferences, Improve app performance, Analyze usage patterns, Enhance security.

5. Data Security

We implement reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no internet transmission or electronic storage method is completely secure, and we cannot guarantee absolute security.

6. Data Retention

We retain your information only for as long as necessary to: Provide our services, Meet legal and regulatory obligations, Resolve disputes, Enforce our agreements.

7. Your Rights

Depending on your location and applicable laws, you may have the right to: Access your personal information, Correct inaccurate information, Delete your account and personal information, Withdraw consent where applicable, Request a copy of your personal data. To exercise these rights, contact us using the details below.

8. Children's Privacy

Maliquez Connect is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that such information has been collected, we will take steps to delete it promptly.

9. Third-Party Services

Our app may contain links to third-party websites or integrate third-party services, such as maps, payment providers, analytics, or authentication services. These third parties have their own privacy policies, and we are not responsible for their practices.

10. International Data Transfers

Your information may be processed or stored in countries other than your own where our service providers operate. We take reasonable steps to ensure your data is protected in accordance with applicable laws.

11. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will post the updated version in the app and update the "Last Updated" date. Continued use of the app after changes become effective constitutes your acceptance of the revised Privacy Policy.

12. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:

Maliquez Connect
Email: info@maliquez.com
Phone: 07032495905
Address: 112 Ebitu Ukiwe street, Jabi, Abuja.`;

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      businessType: '',
      role: 'USER',
      agreeToTerms: false,
      subscribedToNewsletter: false,
    },
  });

  const role = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Submitting payload:");

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      };
      if (data.role === 'PROVIDER') {
        payload.providerProfile = {
          businessName: data.businessName,
          businessType: data.businessType,
        };
      }
      payload.subscribedToNewsletter = data.subscribedToNewsletter ?? false;
      const response = await registerUser(payload as unknown as RegisterInput);
      toast.success('Account created successfully!');
      
      // Determine redirect path based on user role
      let redirectPath = '/';
      switch (response.data.user.role) {
        case 'ADMIN':
          redirectPath = '/admin/dashboard';
          break;
        case 'PROVIDER':
          redirectPath = '/provider/dashboard';
          break;
        case 'USER':
        default:
          redirectPath = '/dashboard';
          break;
      }
      
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <SeoHead
        title="Create an Account"
        description="Sign up for Maliquez Connect to save favorites, write reviews, and get personalized recommendations."
        canonical="/register"
        noindex
      />
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 mt-2">Join Maliquez Connect today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-600'
                    } focus:border-transparent focus:outline-none focus:ring-2`}
                  placeholder="John"
                />
              </div>
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-600'
                    } focus:border-transparent focus:outline-none focus:ring-2`}
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-600'
                  } focus:border-transparent focus:outline-none focus:ring-2`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-600'
                  } focus:border-transparent focus:outline-none focus:ring-2`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full pl-11 pr-12 py-3 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-600'
                    } focus:border-transparent focus:outline-none focus:ring-2`}
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`w-full pl-11 pr-12 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-600'
                    } focus:border-transparent focus:outline-none focus:ring-2`}
                  placeholder="Repeat password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${role === 'USER'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <input type="radio" value="USER" {...register('role')} className="sr-only" />
                <FiUser className="w-5 h-5" />
                <span className="font-medium">User</span>
              </label>
              <label
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${role === 'PROVIDER'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <input type="radio" value="PROVIDER" {...register('role')} className="sr-only" />
                <FiBriefcase className="w-5 h-5" />
                <span className="font-medium">Provider</span>
              </label>
            </div>
          </div>

          {role === 'PROVIDER' && (
            <>
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  {...register('businessName')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent focus:outline-none"
                  placeholder="Your business name"
                />
                {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>}
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Business Type
                </label>
                <select
                  id="businessType"
                  {...register('businessType')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent focus:outline-none"
                >
                  <option value="">Select business type</option>
                  <option value="EDUCATION">Education</option>
                  <option value="HEALTHCARE">Healthcare</option>
                  <option value="HOSPITALITY">Hospitality</option>
                  <option value="LOGISTICS">Logistics</option>
                </select>
                {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>}
              </div>
            </>
          )}

          <div className="flex items-start gap-3">
            <input
              id="agreeToTerms"
              type="checkbox"
              {...register('agreeToTerms')}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
              I agree to the{' '}
              <button type="button" onClick={() => setShowTerms(true)} className="text-primary-600 hover:text-primary-700 font-medium underline">
                Terms and Conditions
              </button>{' '}
              and{' '}
              <button type="button" onClick={() => setShowPrivacy(true)} className="text-primary-600 hover:text-primary-700 font-medium underline">
                Privacy Policy
              </button>
            </label>
          </div>
          {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}

          <div className="flex items-start gap-3">
            <input
              id="subscribedToNewsletter"
              type="checkbox"
              {...register('subscribedToNewsletter')}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <label htmlFor="subscribedToNewsletter" className="text-sm text-gray-600">
              Subscribe to our newsletter for updates, tips, and exclusive offers
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTerms(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 md:p-8" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>
                <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{termsText}</pre>
              <button
                onClick={() => setShowTerms(false)}
                className="mt-6 w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPrivacy(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 md:p-8" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Privacy Policy</h2>
                <button onClick={() => setShowPrivacy(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{privacyText}</pre>
              <button
                onClick={() => setShowPrivacy(false)}
                className="mt-6 w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
