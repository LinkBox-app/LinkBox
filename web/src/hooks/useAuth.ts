import { useState, useEffect } from 'react';
import { LOGIN_FLAG_KEY, AUTH_TOKEN_KEY } from '../storage-key.constant';
import { getProfile } from '../api/methods/auth.methods';
import type { UserProfile } from '../api/types/auth.types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

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

      // 验证token是否有效
      const userProfile = await getProfile();
      
      setAuthState({
        isAuthenticated: true,
        user: userProfile,
        isLoading: false,
      });
    } catch (error) {
      console.error('验证用户状态失败:', error);
      
      // 清除无效的认证信息
      localStorage.removeItem(LOGIN_FLAG_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  const login = (user: UserProfile, token: string) => {
    localStorage.setItem(LOGIN_FLAG_KEY, 'true');
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    
    setAuthState({
      isAuthenticated: true,
      user,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem(LOGIN_FLAG_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    ...authState,
    login,
    logout,
    refreshAuth: checkAuthStatus,
  };
};