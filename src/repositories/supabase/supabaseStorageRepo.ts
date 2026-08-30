import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'notes';

export class SupabaseFileStorageRepository {
  /**
   * Uploads a PDF blob to the user-scoped storage path: {userId}/{subjectId}/{fileName}.pdf
   */
  async uploadFile(userId: string, subjectId: string, fileName: string, fileBlob: Blob): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const storagePath = `${userId}/${subjectId}/${timestamp}_${sanitizedFileName}`;

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
   * Downloads the file blob from storage.
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
   * Generates a secure, temporary signed URL for viewing/downloading the PDF (valid for 1 hour).
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
