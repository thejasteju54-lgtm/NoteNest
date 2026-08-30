import { IndexedDBSubjectRepository } from '@/repositories/indexeddb/subjectRepo';
import { IndexedDBNoteRepository } from '@/repositories/indexeddb/noteRepo';
import { SupabaseSubjectRepository } from '@/repositories/supabase/supabaseSubjectRepo';
import { SupabaseNoteRepository } from '@/repositories/supabase/supabaseNoteRepo';

export class MigrationService {
  private localSubjectRepo = new IndexedDBSubjectRepository();
  private localNoteRepo = new IndexedDBNoteRepository();
  private supabaseSubjectRepo = new SupabaseSubjectRepository();
  private supabaseNoteRepo = new SupabaseNoteRepository();

  /**
   * Checks if local IndexedDB contains subjects/notes available for migration.
   */
  async getLocalDataSummary(): Promise<{ subjectsCount: number; notesCount: number }> {
    try {
      // Find any local demo user records
      const demoUsers = ['user_thejas_demo', 'user_alex_demo'];
      let subjectsCount = 0;
      let notesCount = 0;

      for (const uid of demoUsers) {
        const subjects = await this.localSubjectRepo.getAll(uid);
        const notes = await this.localNoteRepo.getAll(uid);
        subjectsCount += subjects.length;
        notesCount += notes.length;
      }

      return { subjectsCount, notesCount };
    } catch {
      return { subjectsCount: 0, notesCount: 0 };
    }
  }

  /**
   * Safely migrates local IndexedDB subjects and notes into the authenticated Supabase account.
   */
  async migrateToSupabase(supabaseUserId: string): Promise<{ subjectsMigrated: number; notesMigrated: number }> {
    if (!supabaseUserId) {
      throw new Error('Authenticated Supabase user ID required.');
    }

    let subjectsMigrated = 0;
    let notesMigrated = 0;

    const demoUsers = ['user_thejas_demo', 'user_alex_demo'];
    const subjectIdMap = new Map<string, string>(); // oldId -> newSupabaseId

    for (const uid of demoUsers) {
      const localSubjects = await this.localSubjectRepo.getAll(uid);
      const localNotes = await this.localNoteRepo.getAll(uid);

      for (const subj of localSubjects) {
        // Create subject in Supabase
        const createdSubj = await this.supabaseSubjectRepo.create({
          userId: supabaseUserId,
          name: subj.name,
          colorId: subj.colorId,
          description: subj.description,
        });
        subjectIdMap.set(subj.id, createdSubj.id);
        subjectsMigrated++;
      }

      for (const note of localNotes) {
        const newSubjectId = subjectIdMap.get(note.subjectId);
        if (!newSubjectId) continue;

        const blob = await this.localNoteRepo.getFileBlob(note.id, uid);
        if (!blob) continue;

        await this.supabaseNoteRepo.create(
          {
            userId: supabaseUserId,
            subjectId: newSubjectId,
            title: note.title,
            fileName: note.fileName,
            fileSize: note.fileSize,
            fileType: note.fileType,
          },
          blob
        );
        notesMigrated++;
      }
    }

    return { subjectsMigrated, notesMigrated };
  }
}

export const migrationService = new MigrationService();
