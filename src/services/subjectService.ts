import { Subject, SubjectWithNoteCount } from '@/types/subject';
import { repositories } from '@/repositories';
import { DEFAULT_SUBJECT_COLOR } from '@/config/constants';

export class SubjectService {
  async getSubjectsWithStats(userId: string): Promise<SubjectWithNoteCount[]> {
    if (!userId) return [];

    const subjects = await repositories.subjectRepo.getAll(userId);
    const notes = await repositories.noteRepo.getAll(userId);

    // Aggregate note statistics per subject
    const statsMap = new Map<string, { count: number; size: number; lastDate?: string }>();
    
    for (const note of notes) {
      const current = statsMap.get(note.subjectId) || { count: 0, size: 0, lastDate: undefined };
      current.count += 1;
      current.size += note.fileSize;
      if (!current.lastDate || new Date(note.createdAt) > new Date(current.lastDate)) {
        current.lastDate = note.createdAt;
      }
      statsMap.set(note.subjectId, current);
    }

    return subjects.map((subj) => {
      const stats = statsMap.get(subj.id) || { count: 0, size: 0 };
      return {
        ...subj,
        noteCount: stats.count,
        totalSizeBytes: stats.size,
        lastUpdatedNoteAt: stats.lastDate,
      };
    });
  }

  async getSubjectById(userId: string, id: string): Promise<SubjectWithNoteCount | null> {
    if (!userId || !id) return null;

    const subject = await repositories.subjectRepo.getById(id, userId);
    if (!subject) return null;

    const count = await repositories.noteRepo.countBySubject(id, userId);
    const notes = await repositories.noteRepo.getAll(userId, id);
    const totalSize = notes.reduce((sum, n) => sum + n.fileSize, 0);

    return {
      ...subject,
      noteCount: count,
      totalSizeBytes: totalSize,
    };
  }

  async createSubject(
    userId: string,
    name: string,
    colorId: string = DEFAULT_SUBJECT_COLOR.id,
    description?: string
  ): Promise<Subject> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Subject name cannot be empty.');
    }

    // Check for duplicate names for this user
    const existing = await repositories.subjectRepo.getAll(userId);
    const isDuplicate = existing.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(`A subject named "${trimmedName}" already exists.`);
    }

    return repositories.subjectRepo.create({
      userId,
      name: trimmedName,
      colorId,
      description: description?.trim(),
    });
  }

  async updateSubject(
    userId: string,
    id: string,
    name: string,
    colorId?: string,
    description?: string
  ): Promise<Subject> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Subject name cannot be empty.');
    }

    // Check if new name conflicts with another subject
    const existing = await repositories.subjectRepo.getAll(userId);
    const isDuplicate = existing.some(
      (s) => s.id !== id && s.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(`Another subject is already named "${trimmedName}".`);
    }

    return repositories.subjectRepo.update(id, userId, {
      name: trimmedName,
      colorId,
      description: description?.trim(),
    });
  }

  async deleteSubject(userId: string, id: string): Promise<boolean> {
    if (!userId || !id) return false;

    // Cascade delete all notes in this subject
    await repositories.noteRepo.deleteBySubject(id, userId);

    // Delete the subject record
    return repositories.subjectRepo.delete(id, userId);
  }
}

export const subjectService = new SubjectService();
