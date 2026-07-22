import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,
};

interface SetCredentialsPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RestoreAuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    restoreAuth: (state, action: PayloadAction<RestoreAuthPayload>) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, restoreAuth, setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
