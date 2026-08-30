import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types/auth';
import { authService } from '@/services/authService';
import { Session } from '@supabase/supabase-js';

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ emailConfirmationRequired: boolean }>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password?: string) => Promise<{ emailConfirmationRequired: boolean }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initializeSession = useCallback(async () => {
    try {
      setLoading(true);
      const [activeSession, activeUser] = await Promise.all([
        authService.getCurrentSession(),
        authService.getCurrentUser(),
      ]);
      setSession(activeSession);
      setUser(activeUser);
    } catch (err) {
      console.error('Session initialization error:', err);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeSession();

    const unsubscribe = authService.onAuthStateChange((updatedUser, updatedSession) => {
      setUser(updatedUser);
      setSession(updatedSession);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initializeSession]);

  const signIn = async (email: string, password: string) => {
    const loggedIn = await authService.login(email, password);
    const activeSession = await authService.getCurrentSession();
    setUser(loggedIn);
    setSession(activeSession);
    return loggedIn;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const result = await authService.register(name, email, password);
    if (result.user && result.session) {
      setUser(result.user);
      setSession(result.session);
    }
    return { emailConfirmationRequired: result.emailConfirmationRequired };
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
  };

  const login = (email: string, password: string) => signIn(email, password);
  const register = (name: string, email: string, password?: string) =>
    signUp(email, password || '', name);
  const logout = () => signOut();

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isLoading: loading,
        signUp,
        signIn,
        signOut,
        login,
        register,
        logout,
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
