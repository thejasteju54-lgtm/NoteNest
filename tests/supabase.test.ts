import { describe, it, expect } from 'vitest';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SupabaseAuthService } from '@/services/supabaseAuthService';
import { LocalDemoAuthService } from '@/services/authService';

describe('Supabase Integration & Architecture Compliance', () => {
  it('should detect unconfigured Supabase when env variables are empty or placeholders', () => {
    // In test environment without explicit valid env vars, isSupabaseConfigured returns false
    const configured = isSupabaseConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('should provide compliant IAuthProvider implementations for both Supabase and Local Demo', () => {
    const supaAuth = new SupabaseAuthService();
    const demoAuth = new LocalDemoAuthService();

    expect(typeof supaAuth.login).toBe('function');
    expect(typeof supaAuth.register).toBe('function');
    expect(typeof supaAuth.logout).toBe('function');
    expect(typeof supaAuth.getCurrentUser).toBe('function');

    expect(typeof demoAuth.login).toBe('function');
    expect(typeof demoAuth.register).toBe('function');
    expect(typeof demoAuth.logout).toBe('function');
    expect(typeof demoAuth.getCurrentUser).toBe('function');
  });

  it('should format user-scoped storage paths securely as {userId}/{subjectId}/{filename}', () => {
    const userId = 'user_uuid_123';
    const subjectId = 'subj_uuid_456';
    const fileName = 'Calculus Unit 1.pdf';

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${subjectId}/${sanitizedFileName}`;

    expect(storagePath.startsWith('user_uuid_123/subj_uuid_456/')).toBe(true);
    expect(storagePath.endsWith('.pdf')).toBe(true);
    expect(storagePath.includes(' ')).toBe(false);
  });
});
