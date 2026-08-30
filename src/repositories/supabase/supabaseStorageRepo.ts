import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'notenest-files';

export class SupabaseFileStorageRepository {
  /**
   * Uploads a PDF blob to the user-scoped storage path:
   * {user_id}/{subject_id}/{timestamp}-{unique_uuid}.pdf
   */
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
      throw new Error(`Failed to upload PDF to cloud storage: ${error.message}`);
    }

    return storagePath;
  }

  /**
   * Downloads the file blob from storage using authenticated session.
   */
  async downloadFile(storagePath: string): Promise<Blob | null> {
    if (!supabase) return null;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(storagePath);

    if (error || !data) {
      console.error('Error downloading file from storage:', error);
      return null;
    }

    return data;
  }

  /**
   * Generates a secure, temporary signed URL for viewing the PDF (default 1 hour expiry).
   */
  async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string | null> {
    if (!supabase) return null;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  }

  /**
   * Deletes a file from cloud storage.
   */
  async deleteFile(storagePath: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    return !error;
  }

  /**
   * Deletes all files in a folder path.
   */
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
