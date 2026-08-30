import { Note } from './note';
import { SubjectWithNoteCount } from './subject';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

export interface SearchResults {
  query: string;
  matchingSubjects: SubjectWithNoteCount[];
  matchingNotes: (Note & { subjectName: string; subjectColorId: string })[];
  totalMatches: number;
}

export type ActivePage = 
  | { type: 'dashboard' }
  | { type: 'subject'; subjectId: string }
  | { type: 'settings' };

export type ViewMode = 'grid' | 'list';
