import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth-service';
import { apiClient } from '../services/api-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = apiClient.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const currentUser = await authService.me();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      apiClient.setToken(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      setUser(null);
    });
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const result = await authService.login({ email, password });
    setUser(result.user);
    return result;
  };

  const register = async (email, password, name) => {
    const result = await authService.register({ email, password, name });
    setUser(result.user);
    return result;
  };

  const quickDemoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await authService.login({
        email: 'developer@brahma-astra.local',
        password: 'DevPassword123!'
      });
      setUser(res.user);
      return res;
    } catch {
      try {
        const regRes = await authService.register({
          email: 'amlan@brahma-astra.local',
          password: 'DevPassword123!',
          name: 'Amlan Nanda'
        });
        setUser(regRes.user);
        return regRes;
      } catch {
        const demoUser = {
          id: 'demo-user-amlan',
          email: 'amlan.nanda@brahma.ai',
          name: 'Amlan Nanda',
          role: 'admin'
        };
        apiClient.setToken('demo-session-token');
        setUser(demoUser);
        return { user: demoUser, token: 'demo-session-token' };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    quickDemoLogin,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
