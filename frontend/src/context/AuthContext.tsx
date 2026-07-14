import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, restoreAuth, setUser, logout as logoutAction, setLoading } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';
import type { User, LoginInput, RegisterInput, ApiResponse } from '../types';
import type { RootState } from '../store';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginInput) => Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>;
  register: (data: RegisterInput) => Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<ApiResponse<User>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      dispatch(setLoading(true));
      authApi.getProfile()
        .then((res) => {
          dispatch(restoreAuth({
            user: res.data.data,
            accessToken,
            refreshToken,
          }));
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch(setLoading(false));
        })
        .finally(() => dispatch(setLoading(false)));
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const login = async (credentials: LoginInput): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
    const res = await authApi.login(credentials);
    dispatch(setCredentials(res.data.data));
    return res.data;
  };

  const register = async (data: RegisterInput): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
    console.log("register data", data);
    const res = await authApi.register(data);
    dispatch(setCredentials(res.data.data));
    return res.data;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      dispatch(logoutAction());
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const res = await authApi.updateProfile(data);
    dispatch(setUser(res.data.data));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
