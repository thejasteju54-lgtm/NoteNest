import { IFileStorageRepository } from './types';

const R2_QUOTA_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB Free Forever Tier

export interface R2Config {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName: string;
  publicDomain?: string;
}

export function getR2Config(): R2Config {
  return {
    accountId: import.meta.env.VITE_R2_ACCOUNT_ID?.trim(),
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID?.trim(),
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY?.trim(),
    bucketName: import.meta.env.VITE_R2_BUCKET_NAME?.trim() || 'notenest-files',
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

    // In a browser environment, uploads communicate with Cloudflare R2 presigned worker or custom S3 endpoint
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
