import { APP_CONFIG } from '@/config/constants';
import { FileValidationResult } from '@/types/note';

export class FileValidationService {
  /**
   * Performs layered validation on an uploaded file.
   * Checks:
   * 1. Extension (.pdf)
   * 2. MIME type (application/pdf)
   * 3. Max size limit (50MB)
   * 4. Magic number header signature (%PDF-)
   */
  async validatePdfFile(file: File): Promise<FileValidationResult> {
    // 1. File existence check
    if (!file) {
      return { isValid: false, error: 'No file was provided.' };
    }

    // 2. File extension check
    const fileName = file.name.toLowerCase();
    const hasValidExtension = APP_CONFIG.ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `Invalid file type. Only PDF files (${APP_CONFIG.ALLOWED_EXTENSIONS.join(', ')}) are supported.`,
      };
    }

    // 3. MIME type check (allow empty mime if OS doesn't report it, but if reported must be application/pdf)
    if (file.type && !(APP_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid MIME type (${file.type}). Expected application/pdf.`,
      };
    }

    // 4. File size check
    if (file.size > APP_CONFIG.MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `File is too large (${sizeMB} MB). Maximum allowed size is ${APP_CONFIG.MAX_FILE_SIZE_LABEL}.`,
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: 'The uploaded file is empty (0 bytes).',
      };
    }

    // 5. Magic Byte Signature check (%PDF- = 0x25, 0x50, 0x44, 0x46, 0x2D)
    try {
      const headerBytes = await this.readFirstBytes(file, 5);
      const isPdfHeader = this.checkMagicBytes(headerBytes, APP_CONFIG.PDF_MAGIC_BYTES);

      if (!isPdfHeader) {
        return {
          isValid: false,
          error: 'Corrupted or fake PDF file. File header does not match standard PDF signature (%PDF-).',
        };
      }
    } catch {
      return {
        isValid: false,
        error: 'Could not read file header. Please ensure the file is accessible and not corrupted.',
      };
    }

    return { isValid: true };
  }

  private async readFirstBytes(file: Blob, byteCount: number): Promise<Uint8Array> {
    const slice = file.slice(0, byteCount);
    const arrayBuffer = await slice.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  checkMagicBytes(actual: Uint8Array, expected: readonly number[]): boolean {
    if (actual.length < expected.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }
    return true;
  }
}

export const fileValidationService = new FileValidationService();
