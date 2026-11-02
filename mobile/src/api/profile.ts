import { api } from '@/lib/api';
import type { ApiSuccess, ProviderProfile, User } from '@/types';

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  providerProfile?: Partial<ProviderProfile>;
}

export async function updateProfile(payload: ProfileUpdate): Promise<User> {
  const { data } = await api.put<ApiSuccess<User>>('/auth/profile', payload);
  return data.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.put('/auth/change-password', { currentPassword, newPassword });
}
