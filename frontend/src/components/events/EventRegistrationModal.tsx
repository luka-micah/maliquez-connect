import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { eventRegistrationApi } from '../../api/authApi';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import type { AppEvent } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  event: AppEvent;
  onClose: () => void;
}

const EventRegistrationModal = ({ event, onClose }: Props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: { eventId: string; firstName: string; lastName: string; email: string; phone?: string }) =>
      eventRegistrationApi.register(data),
    onSuccess: () => {
      setSuccess(true);
      toast.success('Registration successful!');
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ eventId: event.id, firstName, lastName, email, phone: phone || undefined });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl overflow-hidden max-w-md w-full mx-4 shadow-2xl animate-fade-in-up"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>

        {success ? (
          <div className="p-8 text-center">
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">You're Registered!</h3>
            <p className="text-gray-500 text-sm mb-6">
              We've received your registration for <strong>{event.title}</strong>. We'll send you updates at {email}.
            </p>
            <button onClick={onClose} className="btn-primary">
              Done
            </button>
          </div>
        ) : (
          <>
            {event.image && (
              <img src={event.image} alt={event.title} className="w-full h-36 object-cover" />
            )}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Register for Event</h3>
              <p className="text-sm text-gray-500 mb-5">{event.title}</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="btn-primary w-full text-sm mt-2"
                >
                  {mutation.isPending ? 'Registering...' : 'Register'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventRegistrationModal;
