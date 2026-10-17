import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setStoredToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('brahma_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        if (response?.user) {
          setUser(response.user);
        } else {
          setStoredToken(null);
        }
      } catch (err) {
        console.warn('Session restoration failed:', err.message);
        setStoredToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setIsLoading(true);
    try {
      const data = await api.register({ email, password, name });
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setStoredToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
