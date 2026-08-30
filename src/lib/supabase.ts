import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * Checks if valid Supabase configuration is present in environment variables.
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  // Ensure not placeholder values
  if (
    supabaseUrl.includes('your-project-id') ||
    supabaseAnonKey.includes('your-anon-publishable-key') ||
    supabaseUrl.length < 10 ||
    supabaseAnonKey.length < 10
  ) {
    return false;
  }
  try {
    new URL(supabaseUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Centralized Supabase client instance.
 * Returns null if Supabase environment variables are not configured.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
