import { describe, it, expect } from 'vitest';
import { fileValidationService } from '@/services/fileValidationService';
import { APP_CONFIG } from '@/config/constants';

describe('FileValidationService', () => {
  it('should validate a correct PDF file with %PDF- header', async () => {
    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // %PDF-1.4
    const validFile = new File([validPdfBytes], 'Calculus_Notes.pdf', {
      type: 'application/pdf',
    });

    const result = await fileValidationService.validatePdfFile(validFile);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject a file with an invalid extension', async () => {
    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const invalidFile = new File([validPdfBytes], 'Malicious.exe', {
      type: 'application/pdf',
    });

    const result = await fileValidationService.validatePdfFile(invalidFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Only PDF files');
  });

  it('should reject a fake PDF file with an invalid magic signature', async () => {
    // Text file renamed to .pdf
    const fakeBytes = new TextEncoder().encode('Hello this is a plain text file pretending to be PDF');
    const fakeFile = new File([fakeBytes], 'fake_lecture.pdf', {
      type: 'application/pdf',
    });

    const result = await fileValidationService.validatePdfFile(fakeFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Corrupted or fake PDF file');
  });

  it('should reject a file that exceeds the centralized 50MB limit', async () => {
    // Create a mock oversized file object
    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const mockFile = new File([validPdfBytes], 'Huge_Book.pdf', {
      type: 'application/pdf',
    });

    // Mock size property
    Object.defineProperty(mockFile, 'size', {
      value: APP_CONFIG.MAX_FILE_SIZE_BYTES + 1024,
      writable: false,
    });

    const result = await fileValidationService.validatePdfFile(mockFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('File is too large');
  });

  it('should reject an empty 0-byte file', async () => {
    const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
    const result = await fileValidationService.validatePdfFile(emptyFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('empty');
  });
});
