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
  login(email: string, name?: string): Promise<User>;
  register(name: string, email: string): Promise<User>;
  logout(): Promise<void>;
  listDemoAccounts(): readonly DemoAccount[];
  switchDemoAccount(accountId: string): Promise<User>;
}
