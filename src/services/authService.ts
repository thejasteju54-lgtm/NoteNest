import { User, IAuthProvider } from '@/types/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { getInitials } from '@/config/demoAccounts';
import { validateStudentEmail, validateStrongPassword } from '@/utils/authValidation';

export class ProductionSupabaseAuthService implements IAuthProvider {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  async getCurrentSession(): Promise<Session | null> {
    if (!supabase) return null;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return null;
      return session;
    } catch {
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;

    try {
      const {
        data: { user: supaUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !supaUser) {
        return null;
      }

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
      throw new Error('Supabase is not configured. Check your environment variables.');
    }

    const emailCheck = validateStudentEmail(email);
    if (!emailCheck.isValid) {
      throw new Error(emailCheck.error);
    }

    if (!password) {
      throw new Error('Please enter your password.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('invalid login credentials')) {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }
      if (msg.includes('email not confirmed')) {
        throw new Error('Your email address has not been confirmed yet. Please check your inbox for the verification link.');
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

  async register(
    name: string,
    email: string,
    password?: string
  ): Promise<{ user: User | null; session: Session | null; emailConfirmationRequired: boolean }> {
    if (!supabase) {
      throw new Error('Supabase is not configured. Check your environment variables.');
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      throw new Error('Please enter your full student name (at least 2 characters).');
    }

    // 1. Strict Email & Disposable Domain Validation
    const emailCheck = validateStudentEmail(email);
    if (!emailCheck.isValid) {
      throw new Error(emailCheck.error);
    }

    // 2. Strict Strong Password Validation
    const passwordCheck = validateStrongPassword(password || '');
    if (!passwordCheck.isValid) {
      throw new Error(passwordCheck.error);
    }

    const trimmedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: password!,
      options: {
        data: {
          display_name: trimmedName,
        },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('user already exists')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      if (msg.includes('rate limit') || msg.includes('rate_limit')) {
        throw new Error('Email verification rate limit reached. Please wait a few minutes before requesting another email.');
      }
      throw new Error(error.message || 'Registration failed.');
    }

    const supaUser = data.user;
    const session = data.session;
    const emailConfirmationRequired = !session || !supaUser?.email_confirmed_at;

    let user: User | null = null;
    if (supaUser && session) {
      user = {
        id: supaUser.id,
        name: trimmedName,
        email: trimmedEmail,
        avatarInitials: getInitials(trimmedName),
        avatarColor: 'sage',
        createdAt: supaUser.created_at,
      };
    }

    return { user, session, emailConfirmationRequired };
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const emailCheck = validateStudentEmail(email);
    if (!emailCheck.isValid) {
      throw new Error(emailCheck.error);
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        throw new Error('Please wait 60 seconds before requesting another verification email.');
      }
      throw new Error(error.message || 'Failed to resend confirmation email.');
    }
  }

  async logout(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase sign out error:', error);
    }
  }

  onAuthStateChange(callback: (user: User | null, session: Session | null) => void): () => void {
    if (!supabase) return () => {};

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null, null);
        return;
      }

      const supaUser = session.user;
      const displayName =
        supaUser.user_metadata?.display_name ||
        supaUser.email?.split('@')[0] ||
        'Student';

      const appUser: User = {
        id: supaUser.id,
        name: displayName,
        email: supaUser.email || '',
        avatarInitials: getInitials(displayName),
        avatarColor: 'sage',
        createdAt: supaUser.created_at,
      };

      callback(appUser, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const authService = new ProductionSupabaseAuthService();
