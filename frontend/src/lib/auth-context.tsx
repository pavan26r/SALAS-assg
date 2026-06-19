'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('sales_token');
    const userStr = localStorage.getItem('sales_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const { token, user } = res.data;
    localStorage.setItem('sales_token', token);
    localStorage.setItem('sales_user', JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const signup = async (name: string, email: string, password: string, role?: string) => {
    const res = await authAPI.signup(name, email, password, role);
    const { token, user } = res.data;
    localStorage.setItem('sales_token', token);
    localStorage.setItem('sales_user', JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('sales_token');
    localStorage.removeItem('sales_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  };

  return <AuthContext.Provider value={{ ...state, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
