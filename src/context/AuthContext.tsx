import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, DemoAccount } from '@/types/auth';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isSupabase: boolean;
  demoAccounts: readonly DemoAccount[];
  login: (email: string, password?: string) => Promise<User>;
  register: (name: string, email: string, password?: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  switchDemoAccount: (accountId: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isSupabase = isSupabaseConfigured();

  const loadCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const active = await authService.getCurrentUser();
      setUser(active);
    } catch (err) {
      console.error('Failed to load current user:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();

    // Subscribe to real-time auth changes if provider supports it
    if (authService.onAuthStateChange) {
      const unsubscribe = authService.onAuthStateChange((updatedUser) => {
        setUser(updatedUser);
      });
      return () => unsubscribe();
    }
  }, [loadCurrentUser]);

  const login = async (email: string, password?: string) => {
    const loggedIn = await authService.login(email, password);
    setUser(loggedIn);
    return loggedIn;
  };

  const register = async (name: string, email: string, password?: string) => {
    const created = await authService.register(name, email, password);
    setUser(created);
    return created;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (authService.resetPassword) {
      await authService.resetPassword(email);
    }
  };

  const loginWithGoogle = async () => {
    if (authService.loginWithGoogle) {
      await authService.loginWithGoogle();
    }
  };

  const switchDemoAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      const switched = await authService.switchDemoAccount(accountId);
      setUser(switched);
      return switched;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSupabase,
        demoAccounts: authService.listDemoAccounts(),
        login,
        register,
        logout,
        resetPassword,
        loginWithGoogle,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
