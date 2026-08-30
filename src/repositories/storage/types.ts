/**
 * Universal File Storage Repository Interface
 * Supports Supabase Storage, Cloudflare R2, and AWS S3
 */
export interface IFileStorageRepository {
  /**
   * Uploads a PDF blob to user-scoped storage path: {userId}/{subjectId}/{timestamp}-{uuid}.pdf
   */
  uploadFile(userId: string, subjectId: string, fileBlob: Blob): Promise<string>;

  /**
   * Downloads a PDF file blob by storage path.
   */
  downloadFile(storagePath: string): Promise<Blob | null>;

  /**
   * Generates a secure, temporary signed URL for private viewing.
   */
  getSignedUrl(storagePath: string, expiresInSeconds?: number): Promise<string | null>;

  /**
   * Deletes a file by storage path.
   */
  deleteFile(storagePath: string): Promise<boolean>;

  /**
   * Deletes all files in a folder path.
   */
  deleteFolder(folderPath: string): Promise<boolean>;

  /**
   * Returns provider identifier ('r2' | 'supabase')
   */
  getProviderName(): 'Cloudflare R2 (10 GB)' | 'Supabase Cloud Storage (1 GB)';

  /**
   * Max storage quota in bytes (10 GB for R2, 1 GB for Supabase)
   */
  getQuotaBytes(): number;
}
