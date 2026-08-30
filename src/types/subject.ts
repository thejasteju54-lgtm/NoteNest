export interface Subject {
  id: string;
  userId: string;
  name: string;
  colorId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectWithNoteCount extends Subject {
  noteCount: number;
  totalSizeBytes: number;
  lastUpdatedNoteAt?: string;
}
