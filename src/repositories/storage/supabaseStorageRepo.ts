import { supabase } from '@/lib/supabase';
import { IFileStorageRepository } from './types';

const BUCKET_NAME = 'notenest-files';
const SUPABASE_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB Free Tier

export class SupabaseFileStorageRepository implements IFileStorageRepository {
  getProviderName(): 'Cloudflare R2 (10 GB)' | 'Supabase Cloud Storage (1 GB)' {
    return 'Supabase Cloud Storage (1 GB)';
  }

  getQuotaBytes(): number {
    return SUPABASE_QUOTA_BYTES;
  }

  async uploadFile(userId: string, subjectId: string, fileBlob: Blob): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const timestamp = Date.now();
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    const storagePath = `${userId}/${subjectId}/${timestamp}-${uniqueId}.pdf`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBlob, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload PDF to Supabase storage: ${error.message}`);
    }

    return storagePath;
  }

  async downloadFile(storagePath: string): Promise<Blob | null> {
    if (!supabase) return null;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(storagePath);

    if (error || !data) {
      console.error('Error downloading file from Supabase storage:', error);
      return null;
    }

    return data;
  }

  async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string | null> {
    if (!supabase) return null;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.error('Error generating signed URL from Supabase storage:', error);
      return null;
    }

    return data.signedUrl;
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    return !error;
  }

  async deleteFolder(folderPath: string): Promise<boolean> {
    if (!supabase) return false;

    const { data: list, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath);

    if (listError || !list || list.length === 0) return true;

    const pathsToDelete = list.map((item) => `${folderPath}/${item.name}`);
    const { error } = await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);

    return !error;
  }
}

export const supabaseStorageRepo = new SupabaseFileStorageRepository();
