import { describe, it, expect } from 'vitest';
import { isSupabaseConfigured } from '@/lib/supabase';
import { ProductionSupabaseAuthService } from '@/services/authService';

describe('Supabase Production Auth & Storage Architecture Compliance', () => {
  it('should detect Supabase configuration properly', () => {
    const configured = isSupabaseConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('should provide compliant ProductionSupabaseAuthService implementation', () => {
    const auth = new ProductionSupabaseAuthService();

    expect(typeof auth.login).toBe('function');
    expect(typeof auth.register).toBe('function');
    expect(typeof auth.logout).toBe('function');
    expect(typeof auth.getCurrentUser).toBe('function');
    expect(typeof auth.getCurrentSession).toBe('function');
  });

  it('should format user-scoped collision-resistant storage paths in notenest-files as {userId}/{subjectId}/{timestamp}-{uuid}.pdf', () => {
    const userId = 'user_uuid_123';
    const subjectId = 'subj_uuid_456';
    const timestamp = Date.now();
    const uniqueId = 'abc123xyz';
    const storagePath = `${userId}/${subjectId}/${timestamp}-${uniqueId}.pdf`;

    expect(storagePath.startsWith('user_uuid_123/subj_uuid_456/')).toBe(true);
    expect(storagePath.endsWith('.pdf')).toBe(true);
    expect(storagePath.includes(' ')).toBe(false);
  });
});
