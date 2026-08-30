import { SearchResults } from '@/types/common';
import { SubjectWithNoteCount } from '@/types/subject';
import { subjectService } from './subjectService';
import { noteService } from './noteService';

export class SearchService {
  /**
   * Executes normalized case-insensitive substring search across subjects and note titles.
   */
  async search(userId: string, query: string): Promise<SearchResults> {
    const trimmed = query.trim().toLowerCase();

    if (!userId || !trimmed) {
      return {
        query,
        matchingSubjects: [],
        matchingNotes: [],
        totalMatches: 0,
      };
    }

    // 1. Fetch subjects and notes for the user
    const [allSubjects, allNotes] = await Promise.all([
      subjectService.getSubjectsWithStats(userId),
      noteService.getNotes(userId),
    ]);

    const subjectMap = new Map<string, SubjectWithNoteCount>();
    allSubjects.forEach((s) => subjectMap.set(s.id, s));

    // 2. Filter subjects by name or description
    const matchingSubjects = allSubjects.filter((subj) =>
      subj.name.toLowerCase().includes(trimmed) ||
      (subj.description && subj.description.toLowerCase().includes(trimmed))
    );

    // 3. Filter notes by title or original file name
    const matchingNotes = allNotes
      .filter((note) =>
        note.title.toLowerCase().includes(trimmed) ||
        note.fileName.toLowerCase().includes(trimmed)
      )
      .map((note) => {
        const parentSubject = subjectMap.get(note.subjectId);
        return {
          ...note,
          subjectName: parentSubject ? parentSubject.name : 'Unknown Subject',
          subjectColorId: parentSubject ? parentSubject.colorId : 'sage',
        };
      });

    return {
      query,
      matchingSubjects,
      matchingNotes,
      totalMatches: matchingSubjects.length + matchingNotes.length,
    };
  }
}

export const searchService = new SearchService();
