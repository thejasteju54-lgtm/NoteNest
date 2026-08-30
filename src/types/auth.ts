export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
}

export interface IAuthProvider {
  getCurrentUser(): Promise<User | null>;
  login(email: string, password?: string): Promise<User>;
  register(name: string, email: string, password?: string): Promise<User>;
  logout(): Promise<void>;
  resetPassword?(email: string): Promise<void>;
  loginWithGoogle?(): Promise<void>;
  onAuthStateChange?(callback: (user: User | null) => void): () => void;
  isConfigured(): boolean;
  listDemoAccounts(): readonly DemoAccount[];
  switchDemoAccount(accountId: string): Promise<User>;
}
