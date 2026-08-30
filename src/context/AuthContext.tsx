import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, DemoAccount } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  demoAccounts: readonly DemoAccount[];
  login: (email: string, name?: string) => Promise<User>;
  register: (name: string, email: string) => Promise<User>;
  logout: () => Promise<void>;
  switchDemoAccount: (accountId: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  }, [loadCurrentUser]);

  const login = async (email: string, name?: string) => {
    const loggedIn = await authService.login(email, name);
    setUser(loggedIn);
    return loggedIn;
  };

  const register = async (name: string, email: string) => {
    const created = await authService.register(name, email);
    setUser(created);
    return created;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
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
        demoAccounts: authService.listDemoAccounts(),
        login,
        register,
        logout,
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
