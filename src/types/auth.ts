import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  createdAt: string;
}

export type AuthSession = Session;

export interface IAuthProvider {
  getCurrentUser(): Promise<User | null>;
  getCurrentSession(): Promise<Session | null>;
  login(email: string, password?: string): Promise<User>;
  register(name: string, email: string, password?: string): Promise<{ user: User | null; session: Session | null; emailConfirmationRequired: boolean }>;
  logout(): Promise<void>;
  onAuthStateChange(callback: (user: User | null, session: Session | null) => void): () => void;
  isConfigured(): boolean;
}
