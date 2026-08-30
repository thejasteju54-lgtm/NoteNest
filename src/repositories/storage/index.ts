import { IFileStorageRepository } from './types';
import { supabaseStorageRepo } from './supabaseStorageRepo';
import { r2StorageRepo, isR2Configured } from './r2StorageRepo';

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
    return this.getActiveRepo().uploadFile(userId, subjectId, fileBlob);
  }

  async downloadFile(storagePath: string): Promise<Blob | null> {
    return this.getActiveRepo(storagePath).downloadFile(storagePath);
  }

  async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string | null> {
    return this.getActiveRepo(storagePath).getSignedUrl(storagePath, expiresInSeconds);
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    return this.getActiveRepo(storagePath).deleteFile(storagePath);
  }

  async deleteFolder(folderPath: string): Promise<boolean> {
    return this.getActiveRepo().deleteFolder(folderPath);
  }
}

export const activeStorageRepo = new UniversalStorageManager();
