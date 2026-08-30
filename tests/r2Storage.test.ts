import { describe, it, expect } from 'vitest';
import { activeStorageRepo } from '@/repositories/storage';
import { CloudflareR2StorageRepository } from '@/repositories/storage/r2StorageRepo';
import { SupabaseFileStorageRepository } from '@/repositories/storage/supabaseStorageRepo';

describe('High-Capacity Multi-Provider Storage Engine', () => {
  it('should initialize UniversalStorageManager with valid default provider', () => {
    const providerName = activeStorageRepo.getProviderName();
    expect(['Cloudflare R2 (10 GB)', 'Supabase Cloud Storage (1 GB)']).toContain(providerName);

    const quota = activeStorageRepo.getQuotaBytes();
    expect(quota).toBeGreaterThanOrEqual(1024 * 1024 * 1024); // At least 1 GB
  });

  it('should provide 10 GB quota on Cloudflare R2 repository', () => {
    const r2 = new CloudflareR2StorageRepository({
      accountId: 'mock_account_123',
      accessKeyId: 'mock_key',
      secretAccessKey: 'mock_secret',
      bucketName: 'notenest-files',
    });

    expect(r2.getProviderName()).toBe('Cloudflare R2 (10 GB)');
    expect(r2.getQuotaBytes()).toBe(10 * 1024 * 1024 * 1024); // 10 GB
  });

  it('should generate collision-resistant storage paths with user isolation', async () => {
    const r2 = new CloudflareR2StorageRepository();
    const mockBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
    const path = await r2.uploadFile('user_uuid_a', 'subject_uuid_b', mockBlob);

    expect(path.startsWith('r2://user_uuid_a/subject_uuid_b/')).toBe(true);
    expect(path.endsWith('.pdf')).toBe(true);
  });

  it('should support Supabase storage repo with 1 GB quota', () => {
    const supaRepo = new SupabaseFileStorageRepository();
    expect(supaRepo.getProviderName()).toBe('Supabase Cloud Storage (1 GB)');
    expect(supaRepo.getQuotaBytes()).toBe(1024 * 1024 * 1024);
  });
});
