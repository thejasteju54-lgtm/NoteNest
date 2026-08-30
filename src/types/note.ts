export interface Note {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteSortOption = 
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'size-desc';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}
