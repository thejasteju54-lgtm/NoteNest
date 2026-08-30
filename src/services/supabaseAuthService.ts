import { User, DemoAccount, IAuthProvider } from '@/types/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DEMO_ACCOUNTS, getInitials } from '@/config/demoAccounts';

export class SupabaseAuthService implements IAuthProvider {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        return null;
      }

      const supaUser = session.user;
      
      // Fetch user profile from profiles table if exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, created_at')
        .eq('id', supaUser.id)
        .maybeSingle();

      const displayName =
        profile?.display_name ||
        supaUser.user_metadata?.display_name ||
        supaUser.email?.split('@')[0] ||
        'Student';

      return {
        id: supaUser.id,
        name: displayName,
        email: supaUser.email || '',
        avatarInitials: getInitials(displayName),
        avatarColor: 'sage',
        createdAt: profile?.created_at || supaUser.created_at || new Date().toISOString(),
      };
    } catch (err) {
      console.error('Failed to get current user from Supabase:', err);
      return null;
    }
  }

  async login(email: string, password?: string): Promise<User> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    if (!password) {
      throw new Error('Password is required for Supabase authentication.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      if (error?.message?.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      throw new Error(error?.message || 'Login failed. Please try again.');
    }

    const supaUser = data.user;
    const displayName =
      supaUser.user_metadata?.display_name ||
      supaUser.email?.split('@')[0] ||
      'Student';

    return {
      id: supaUser.id,
      name: displayName,
      email: supaUser.email || '',
      avatarInitials: getInitials(displayName),
      avatarColor: 'sage',
      createdAt: supaUser.created_at,
    };
  }

  async register(name: string, email: string, password?: string): Promise<User> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          display_name: trimmedName,
        },
      },
    });

    if (error || !data.user) {
      if (error?.message?.toLowerCase().includes('already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw new Error(error?.message || 'Registration failed.');
    }

    const supaUser = data.user;

    return {
      id: supaUser.id,
      name: trimmedName,
      email: trimmedEmail,
      avatarInitials: getInitials(trimmedName),
      avatarColor: 'sage',
      createdAt: supaUser.created_at,
    };
  }

  async logout(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase sign out error:', error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/#reset-password`,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send password reset email.');
    }
  }

  async loginWithGoogle(): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to initiate Google login.');
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (!supabase) return () => {};

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }

      const supaUser = session.user;
      const displayName =
        supaUser.user_metadata?.display_name ||
        supaUser.email?.split('@')[0] ||
        'Student';

      callback({
        id: supaUser.id,
        name: displayName,
        email: supaUser.email || '',
        avatarInitials: getInitials(displayName),
        avatarColor: 'sage',
        createdAt: supaUser.created_at,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  listDemoAccounts(): readonly DemoAccount[] {
    return DEMO_ACCOUNTS;
  }

  async switchDemoAccount(_accountId: string): Promise<User> {
    throw new Error('Demo account switching is only available in local demo mode.');
  }
}
