import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Centralized Supabase credentials with production defaults
const DEFAULT_SUPABASE_URL = 'https://bmisabwbprnslgkeksys.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable__RiHSirSdCBLRF_DU9jatA_JlH-UkBN';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL);
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY);

/**
 * Checks if valid Supabase configuration is present.
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
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
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
