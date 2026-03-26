import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getProfile } from '../api/methods/auth.methods';
import type { UserProfile } from '../api/types/auth.types';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  const loadUserProfile = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const userProfile = await getProfile();

      setAuthState({
        user: userProfile,
        isLoading: false,
      });
    } catch (error) {
      console.error('加载本地用户失败:', error);

      setAuthState({
        user: null,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    void loadUserProfile();
  }, [loadUserProfile]);

  const value = useMemo<AuthContextValue>(() => authState, [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
