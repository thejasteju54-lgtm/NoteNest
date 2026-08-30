import { IFileStorageRepository } from './types';

const R2_QUOTA_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB Free Forever Tier

export interface R2Config {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName: string;
  publicDomain?: string;
}

// Centralized Cloudflare R2 Credentials (10 GB Free Storage Engine)
const DEFAULT_R2_ACCOUNT_ID = 'ce3188a40a71656456c6bc5e937076fa';
const DEFAULT_R2_ACCESS_KEY_ID = '804f21464c86ad073007ec0cda1169dd';
const DEFAULT_R2_SECRET_ACCESS_KEY = 'a8079b561dee448c3f93d6950ced18ac09e0df1881f8d0b902e0c245ec061cd6';
const DEFAULT_R2_BUCKET = 'notenest-files';

export function getR2Config(): R2Config {
  return {
    accountId: import.meta.env.VITE_R2_ACCOUNT_ID?.trim() || DEFAULT_R2_ACCOUNT_ID,
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID?.trim() || DEFAULT_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY?.trim() || DEFAULT_R2_SECRET_ACCESS_KEY,
    bucketName: import.meta.env.VITE_R2_BUCKET_NAME?.trim() || DEFAULT_R2_BUCKET,
    publicDomain: import.meta.env.VITE_R2_PUBLIC_DOMAIN?.trim(),
  };
}

export function isR2Configured(): boolean {
  const config = getR2Config();
  return Boolean(
    config.accountId &&
    config.accessKeyId &&
    config.secretAccessKey &&
    config.accountId.length > 5
  );
}

export class CloudflareR2StorageRepository implements IFileStorageRepository {
  private config: R2Config;

  constructor(config = getR2Config()) {
    this.config = config;
  }

  getProviderName(): 'Cloudflare R2 (10 GB)' | 'Supabase Cloud Storage (1 GB)' {
    return 'Cloudflare R2 (10 GB)';
  }

  getQuotaBytes(): number {
    return R2_QUOTA_BYTES;
  }

  async uploadFile(userId: string, subjectId: string, fileBlob: Blob): Promise<string> {
    const timestamp = Date.now();
    const uniqueId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11);
    const storagePath = `r2://${userId}/${subjectId}/${timestamp}-${uniqueId}.pdf`;

    if (this.config.publicDomain) {
      const uploadUrl = `https://${this.config.publicDomain}/${userId}/${subjectId}/${timestamp}-${uniqueId}.pdf`;
      try {
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/pdf' },
          body: fileBlob,
        });
      } catch (err) {
        console.warn('R2 direct PUT notice:', err);
      }
    }

    return storagePath;
  }

  async downloadFile(storagePath: string): Promise<Blob | null> {
    const url = await this.getSignedUrl(storagePath);
    if (!url) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.blob();
    } catch (err) {
      console.error('Error downloading from R2:', err);
      return null;
    }
  }

  async getSignedUrl(storagePath: string, _expiresInSeconds = 3600): Promise<string | null> {
    const cleanPath = storagePath.replace(/^r2:\/\//, '');
    if (this.config.publicDomain) {
      return `https://${this.config.publicDomain}/${cleanPath}`;
    }
    if (this.config.accountId) {
      return `https://${this.config.accountId}.r2.cloudflarestorage.com/${this.config.bucketName}/${cleanPath}`;
    }
    return null;
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    const cleanPath = storagePath.replace(/^r2:\/\//, '');
    if (this.config.publicDomain) {
      try {
        await fetch(`https://${this.config.publicDomain}/${cleanPath}`, { method: 'DELETE' });
      } catch {}
    }
    return true;
  }

  async deleteFolder(_folderPath: string): Promise<boolean> {
    return true;
  }
}

export const r2StorageRepo = new CloudflareR2StorageRepository();
