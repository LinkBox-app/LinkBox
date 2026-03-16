import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { LOGIN_FLAG_KEY, AUTH_TOKEN_KEY } from '../storage-key.constant';
import { getProfile } from '../api/methods/auth.methods';
import type { UserProfile } from '../api/types/auth.types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const isLoggedIn = localStorage.getItem(LOGIN_FLAG_KEY) === 'true';
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      if (!isLoggedIn || !token) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        return;
      }

      const userProfile = await getProfile();

      setAuthState({
        isAuthenticated: true,
        user: userProfile,
        isLoading: false,
      });
    } catch (error) {
      console.error('验证用户状态失败:', error);

      localStorage.removeItem(LOGIN_FLAG_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);

      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback((user: UserProfile, token: string) => {
    localStorage.setItem(LOGIN_FLAG_KEY, 'true');
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    setAuthState({
      isAuthenticated: true,
      user,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LOGIN_FLAG_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);

    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    void checkAuthStatus();
  }, [checkAuthStatus]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      login,
      logout,
      refreshAuth: checkAuthStatus,
    }),
    [authState, login, logout, checkAuthStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
