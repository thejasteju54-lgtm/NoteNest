import { User, DemoAccount, IAuthProvider } from '@/types/auth';
import { repositories } from '@/repositories';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SupabaseAuthService } from './supabaseAuthService';

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: 'user_thejas_demo',
    name: 'Thejas',
    email: 'thejas.student@university.edu',
    role: 'Computer Science Major',
    avatarColor: 'sage',
  },
  {
    id: 'user_alex_demo',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    role: 'Electrical Engineering Major',
    avatarColor: 'blue',
  },
] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export class LocalDemoAuthService implements IAuthProvider {
  isConfigured(): boolean {
    return false; // Local demo mode
  }

  async getCurrentUser(): Promise<User | null> {
    const user = await repositories.authRepo.getCurrentUser();
    if (user) return user;

    // Default to first demo account if no user is active yet
    const defaultDemo = DEMO_ACCOUNTS[0];
    const initialUser: User = {
      id: defaultDemo.id,
      name: defaultDemo.name,
      email: defaultDemo.email,
      avatarInitials: getInitials(defaultDemo.name),
      avatarColor: defaultDemo.avatarColor,
      createdAt: new Date().toISOString(),
    };

    await repositories.authRepo.saveCurrentUser(initialUser);
    await repositories.authRepo.saveUser(initialUser);
    return initialUser;
  }

  async login(email: string, name?: string): Promise<User> {
    const trimmedEmail = email.trim().toLowerCase();
    const allUsers = await repositories.authRepo.listUsers();
    let existing = allUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!existing) {
      const displayName = name?.trim() || trimmedEmail.split('@')[0];
      existing = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: displayName,
        email: trimmedEmail,
        avatarInitials: getInitials(displayName),
        avatarColor: 'sage',
        createdAt: new Date().toISOString(),
      };
      await repositories.authRepo.saveUser(existing);
    }

    await repositories.authRepo.saveCurrentUser(existing);
    return existing;
  }

  async register(name: string, email: string): Promise<User> {
    const trimmedEmail = email.trim().toLowerCase();
    const displayName = name.trim();

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: displayName,
      email: trimmedEmail,
      avatarInitials: getInitials(displayName),
      avatarColor: 'blue',
      createdAt: new Date().toISOString(),
    };

    await repositories.authRepo.saveUser(newUser);
    await repositories.authRepo.saveCurrentUser(newUser);
    return newUser;
  }

  async logout(): Promise<void> {
    await repositories.authRepo.saveCurrentUser(null);
  }

  listDemoAccounts(): readonly DemoAccount[] {
    return DEMO_ACCOUNTS;
  }

  async switchDemoAccount(accountId: string): Promise<User> {
    const demo = DEMO_ACCOUNTS.find((d) => d.id === accountId);
    if (!demo) {
      throw new Error(`Demo account not found: ${accountId}`);
    }

    const user: User = {
      id: demo.id,
      name: demo.name,
      email: demo.email,
      avatarInitials: getInitials(demo.name),
      avatarColor: demo.avatarColor,
      createdAt: new Date().toISOString(),
    };

    await repositories.authRepo.saveUser(user);
    await repositories.authRepo.saveCurrentUser(user);
    return user;
  }
}

// Active Auth Provider: Supabase if configured, otherwise fallback to Local Demo
export const authService: IAuthProvider = isSupabaseConfigured()
  ? new SupabaseAuthService()
  : new LocalDemoAuthService();
