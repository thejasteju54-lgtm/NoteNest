import { IFileStorageRepository } from './types';
import { supabaseStorageRepo } from './supabaseStorageRepo';
import { r2StorageRepo, isR2Configured } from './r2StorageRepo';
import { withRetry } from '@/utils/retry';

export * from './types';
export * from './supabaseStorageRepo';
export * from './r2StorageRepo';

/**
 * Universal Storage Manager
 * Automatically routes PDF uploads & retrievals to Cloudflare R2 (10 GB) if configured,
 * seamlessly falling back to Supabase Storage (1 GB) with zero configuration overhead.
 */
class UniversalStorageManager implements IFileStorageRepository {
  private getActiveRepo(storagePath?: string): IFileStorageRepository {
    if (storagePath && storagePath.startsWith('r2://')) {
      return r2StorageRepo;
    }
    if (isR2Configured()) {
      return r2StorageRepo;
    }
    return supabaseStorageRepo;
  }

  getProviderName(): 'Cloudflare R2 (10 GB)' | 'Supabase Cloud Storage (1 GB)' {
    return this.getActiveRepo().getProviderName();
  }

  getQuotaBytes(): number {
    return this.getActiveRepo().getQuotaBytes();
  }

  async uploadFile(userId: string, subjectId: string, fileBlob: Blob): Promise<string> {
    return withRetry(() => this.getActiveRepo().uploadFile(userId, subjectId, fileBlob), {
      maxAttempts: 3,
      initialDelayMs: 400,
    });
  }

  async downloadFile(storagePath: string): Promise<Blob | null> {
    return withRetry(
      async () => {
        if (storagePath && storagePath.startsWith('r2://')) {
          const r2Blob = await r2StorageRepo.downloadFile(storagePath);
          if (r2Blob) return r2Blob;
          // Fallback: Check if file exists in Supabase storage under the cleaned path
          const cleanPath = storagePath.replace(/^r2:\/\//, '');
          return supabaseStorageRepo.downloadFile(cleanPath);
        }
        return this.getActiveRepo(storagePath).downloadFile(storagePath);
      },
      {
        maxAttempts: 3,
        initialDelayMs: 350,
      }
    );
  }

  async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string | null> {
    if (storagePath && storagePath.startsWith('r2://')) {
      const r2Url = await r2StorageRepo.getSignedUrl(storagePath, expiresInSeconds);
      if (r2Url) return r2Url;
      const cleanPath = storagePath.replace(/^r2:\/\//, '');
      return supabaseStorageRepo.getSignedUrl(cleanPath, expiresInSeconds);
    }
    return this.getActiveRepo(storagePath).getSignedUrl(storagePath, expiresInSeconds);
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    if (storagePath && storagePath.startsWith('r2://')) {
      await r2StorageRepo.deleteFile(storagePath);
      const cleanPath = storagePath.replace(/^r2:\/\//, '');
      return supabaseStorageRepo.deleteFile(cleanPath);
    }
    return this.getActiveRepo(storagePath).deleteFile(storagePath);
  }

  async deleteFolder(folderPath: string): Promise<boolean> {
    return this.getActiveRepo().deleteFolder(folderPath);
  }
}

export const activeStorageRepo = new UniversalStorageManager();
