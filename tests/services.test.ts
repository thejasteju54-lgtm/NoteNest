import { describe, it, expect, beforeEach } from 'vitest';
import { SubjectService } from '@/services/subjectService';
import { NoteService } from '@/services/noteService';
import { SearchService } from '@/services/searchService';
import { BackupService } from '@/services/backupService';
import { ISubjectRepository, INoteRepository } from '@/types/repository';
import { Subject } from '@/types/subject';
import { Note } from '@/types/note';
import { repositories } from '@/repositories';

// In-Memory Repository Implementation for Unit & Business Logic Tests
class InMemorySubjectRepository implements ISubjectRepository {
  private subjects: Subject[] = [];

  async getAll(userId: string): Promise<Subject[]> {
    return this.subjects.filter((s) => s.userId === userId);
  }

  async getById(id: string, userId: string): Promise<Subject | null> {
    return this.subjects.find((s) => s.id === id && s.userId === userId) || null;
  }

  async create(data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> {
    const now = new Date().toISOString();
    const newSubject: Subject = {
      ...data,
      id: `subj_${Date.now()}_${Math.random()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.subjects.push(newSubject);
    return newSubject;
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Pick<Subject, 'name' | 'colorId' | 'description'>>
  ): Promise<Subject> {
    const subj = await this.getById(id, userId);
    if (!subj) throw new Error('Not found');
    Object.assign(subj, updates, { updatedAt: new Date().toISOString() });
    return subj;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const idx = this.subjects.findIndex((s) => s.id === id && s.userId === userId);
    if (idx >= 0) {
      this.subjects.splice(idx, 1);
      return true;
    }
    return false;
  }
}

class InMemoryNoteRepository implements INoteRepository {
  private notes: Note[] = [];
  private blobs: Map<string, Blob> = new Map();

  async getAll(userId: string, subjectId?: string): Promise<Note[]> {
    return this.notes.filter(
      (n) => n.userId === userId && (!subjectId || n.subjectId === subjectId)
    );
  }

  async getById(id: string, userId: string): Promise<Note | null> {
    return this.notes.find((n) => n.id === id && n.userId === userId) || null;
  }

  async create(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, fileBlob: Blob): Promise<Note> {
    const now = new Date().toISOString();
    const noteId = `note_${Date.now()}_${Math.random()}`;
    const newNote: Note = {
      ...data,
      id: noteId,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.push(newNote);
    this.blobs.set(noteId, fileBlob);
    return newNote;
  }

  async update(id: string, userId: string, updates: Partial<Pick<Note, 'title' | 'subjectId'>>): Promise<Note> {
    const note = await this.getById(id, userId);
    if (!note) throw new Error('Not found');
    Object.assign(note, updates, { updatedAt: new Date().toISOString() });
    return note;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const idx = this.notes.findIndex((n) => n.id === id && n.userId === userId);
    if (idx >= 0) {
      const noteId = this.notes[idx].id;
      this.notes.splice(idx, 1);
      this.blobs.delete(noteId);
      return true;
    }
    return false;
  }

  async deleteBySubject(subjectId: string, userId: string): Promise<number> {
    const toDelete = this.notes.filter((n) => n.userId === userId && n.subjectId === subjectId);
    this.notes = this.notes.filter((n) => !(n.userId === userId && n.subjectId === subjectId));
    toDelete.forEach((n) => this.blobs.delete(n.id));
    return toDelete.length;
  }

  async getFileBlob(id: string, userId: string): Promise<Blob | null> {
    const note = await this.getById(id, userId);
    if (!note) return null;
    return this.blobs.get(id) || null;
  }

  async countBySubject(subjectId: string, userId: string): Promise<number> {
    return this.notes.filter((n) => n.userId === userId && n.subjectId === subjectId).length;
  }
}

describe('SubjectService & NoteService Business Logic', () => {
  let subjectService: SubjectService;
  let noteService: NoteService;
  let searchService: SearchService;
  let backupService: BackupService;

  const USER_A = 'user_thejas_a';
  const USER_B = 'user_alex_b';

  beforeEach(() => {
    // Inject clean in-memory repositories
    repositories.subjectRepo = new InMemorySubjectRepository();
    repositories.noteRepo = new InMemoryNoteRepository();

    subjectService = new SubjectService();
    noteService = new NoteService();
    searchService = new SearchService();
    backupService = new BackupService();
  });

  it('should create, rename, and retrieve subjects with correct stats', async () => {
    const created = await subjectService.createSubject(USER_A, 'Mathematics', 'sage');
    expect(created.name).toBe('Mathematics');
    expect(created.userId).toBe(USER_A);

    // Verify stats
    let subjectsWithStats = await subjectService.getSubjectsWithStats(USER_A);
    expect(subjectsWithStats.length).toBe(1);
    expect(subjectsWithStats[0].noteCount).toBe(0);

    // Rename
    const updated = await subjectService.updateSubject(USER_A, created.id, 'Advanced Mathematics');
    expect(updated.name).toBe('Advanced Mathematics');

    subjectsWithStats = await subjectService.getSubjectsWithStats(USER_A);
    expect(subjectsWithStats[0].name).toBe('Advanced Mathematics');
  });

  it('should reject duplicate subject names for the same user', async () => {
    await subjectService.createSubject(USER_A, 'Physics');
    await expect(subjectService.createSubject(USER_A, 'physics')).rejects.toThrow(
      'already exists'
    );
  });

  it('should enforce user ownership isolation between User A and User B', async () => {
    await subjectService.createSubject(USER_A, 'Calculus');
    const subjectB = await subjectService.createSubject(USER_B, 'Thermodynamics');

    const listA = await subjectService.getSubjectsWithStats(USER_A);
    const listB = await subjectService.getSubjectsWithStats(USER_B);

    expect(listA.length).toBe(1);
    expect(listA[0].name).toBe('Calculus');

    expect(listB.length).toBe(1);
    expect(listB[0].name).toBe('Thermodynamics');

    // User A cannot delete User B's subject
    const deletedByA = await subjectService.deleteSubject(USER_A, subjectB.id);
    expect(deletedByA).toBe(false);

    // Verify subject B still exists
    const checkB = await subjectService.getSubjectById(USER_B, subjectB.id);
    expect(checkB).not.toBeNull();
  });

  it('should upload a valid PDF note, rename, and sort notes properly', async () => {
    const subject = await subjectService.createSubject(USER_A, 'Electrical Engineering');

    // Valid PDF File
    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    const file1 = new File([validPdfBytes], 'Circuits.pdf', { type: 'application/pdf' });
    const file2 = new File([validPdfBytes], 'Transformers.pdf', { type: 'application/pdf' });

    const note1 = await noteService.uploadNote(USER_A, subject.id, 'Circuits Unit 1', file1);
    const note2 = await noteService.uploadNote(USER_A, subject.id, 'Transformers Overview', file2);

    expect(note1.title).toBe('Circuits Unit 1');
    expect(note2.title).toBe('Transformers Overview');

    // Rename note
    const renamed = await noteService.renameNote(USER_A, note1.id, 'Circuit Theory & Kirchoff Laws');
    expect(renamed.title).toBe('Circuit Theory & Kirchoff Laws');

    // Verify sorting
    const notesSortedName = await noteService.getNotes(USER_A, subject.id, 'name-asc');
    expect(notesSortedName[0].title).toBe('Circuit Theory & Kirchoff Laws');
    expect(notesSortedName[1].title).toBe('Transformers Overview');
  });

  it('should cascade delete notes when a subject is deleted', async () => {
    const subject = await subjectService.createSubject(USER_A, 'Programming');
    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const file = new File([validPdfBytes], 'LabManual.pdf', { type: 'application/pdf' });

    await noteService.uploadNote(USER_A, subject.id, 'C Lab Manual', file);
    let notes = await noteService.getNotes(USER_A, subject.id);
    expect(notes.length).toBe(1);

    // Delete subject
    await subjectService.deleteSubject(USER_A, subject.id);

    // Verify notes are also removed
    notes = await noteService.getNotes(USER_A, subject.id);
    expect(notes.length).toBe(0);
  });

  it('should delete a single note independently without affecting other notes in subject', async () => {
    const subject = await subjectService.createSubject(USER_A, 'Chemistry');
    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const file1 = new File([validPdfBytes], 'Organic.pdf', { type: 'application/pdf' });
    const file2 = new File([validPdfBytes], 'Inorganic.pdf', { type: 'application/pdf' });

    const n1 = await noteService.uploadNote(USER_A, subject.id, 'Organic Notes', file1);
    const n2 = await noteService.uploadNote(USER_A, subject.id, 'Inorganic Notes', file2);

    expect((await noteService.getNotes(USER_A, subject.id)).length).toBe(2);

    // Delete note 1
    const deleteResult = await noteService.deleteNote(USER_A, n1.id);
    expect(deleteResult).toBe(true);

    const remaining = await noteService.getNotes(USER_A, subject.id);
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(n2.id);
  });

  it('should perform fast case-insensitive normalized substring search across subjects and notes', async () => {
    const math = await subjectService.createSubject(USER_A, 'Mathematics');
    const phys = await subjectService.createSubject(USER_A, 'Physics');

    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const file1 = new File([validPdfBytes], 'Calculus_Limits.pdf', { type: 'application/pdf' });
    const file2 = new File([validPdfBytes], 'Optics_Lasers.pdf', { type: 'application/pdf' });

    await noteService.uploadNote(USER_A, math.id, 'Differential Calculus Limits', file1);
    await noteService.uploadNote(USER_A, phys.id, 'Laser Optics & Prisms', file2);

    // 1. Search for subject
    const res1 = await searchService.search(USER_A, 'math');
    expect(res1.matchingSubjects.length).toBe(1);
    expect(res1.matchingSubjects[0].name).toBe('Mathematics');

    // 2. Search for note title
    const res2 = await searchService.search(USER_A, 'calculus');
    expect(res2.matchingNotes.length).toBe(1);
    expect(res2.matchingNotes[0].title).toBe('Differential Calculus Limits');
    expect(res2.matchingNotes[0].subjectName).toBe('Mathematics');

    // 3. Search for non-existent term
    const res3 = await searchService.search(USER_A, 'Astronomy');
    expect(res3.totalMatches).toBe(0);
  });

  it('should import a valid backup archive and restore subjects and notes', async () => {
    const mockBackupJson = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      user: { name: 'Thejas', email: 'thejas@test.com' },
      subjects: [
        { id: 'old_subj_1', userId: 'old_u', name: 'Restored Chemistry', colorId: 'mint' },
      ],
      notes: [
        {
          id: 'old_n_1',
          userId: 'old_u',
          subjectId: 'old_subj_1',
          title: 'Restored Unit 1 Notes',
          fileName: 'Unit1.pdf',
          fileSize: 1024,
          fileType: 'application/pdf',
          base64Data: 'JVBERi0xLjQK', // %PDF-1.4
        },
      ],
    });

    const backupFile = new File([mockBackupJson], 'backup.json', { type: 'application/json' });
    const result = await backupService.importBackup(USER_A, backupFile);

    expect(result.subjectsCount).toBe(1);
    expect(result.notesCount).toBe(1);

    const subjects = await subjectService.getSubjectsWithStats(USER_A);
    expect(subjects.some((s) => s.name === 'Restored Chemistry')).toBe(true);
  });
});
