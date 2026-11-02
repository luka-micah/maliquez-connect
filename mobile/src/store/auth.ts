import { create } from 'zustand';

import { api, tokenStore } from '@/lib/api';
import type { ApiSuccess, User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  initialized: boolean;
  load: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  initialized: false,

  async load() {
    const token = await tokenStore.get();
    if (!token) {
      set({ initialized: true });
      return;
    }
    tokenStore.hydrate(token);
    try {
      const { data } = await api.get<ApiSuccess<User>>('/auth/profile');
      set({ token, user: data.data, initialized: true });
    } catch {
      await tokenStore.clear();
      set({ token: null, user: null, initialized: true });
    }
  },

  async login(email: string, password: string) {
    const { data } = await api.post<ApiSuccess<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    await tokenStore.set(data.data.accessToken);
    set({ token: data.data.accessToken, user: data.data.user });
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    }
    await tokenStore.clear();
    set({ token: null, user: null });
  },

  setUser(user: User) {
    set({ user });
  },
}));
