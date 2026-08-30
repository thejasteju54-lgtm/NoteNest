import { Note, NoteSortOption } from '@/types/note';
import { repositories } from '@/repositories';
import { fileValidationService } from './fileValidationService';
import { sanitizeTitle } from '@/utils/formatters';

export class NoteService {
  async getNotes(
    userId: string,
    subjectId?: string,
    sortOption: NoteSortOption = 'newest'
  ): Promise<Note[]> {
    if (!userId) return [];

    const notes = await repositories.noteRepo.getAll(userId, subjectId);
    return this.sortNotes(notes, sortOption);
  }

  async getNoteById(userId: string, id: string): Promise<Note | null> {
    if (!userId || !id) return null;
    return repositories.noteRepo.getById(id, userId);
  }

  async uploadNote(
    userId: string,
    subjectId: string,
    rawTitle: string,
    file: File
  ): Promise<Note> {
    if (!userId) {
      throw new Error('User authentication required.');
    }
    if (!subjectId) {
      throw new Error('Please select a destination subject.');
    }

    // 1. Verify destination subject belongs to user
    const subject = await repositories.subjectRepo.getById(subjectId, userId);
    if (!subject) {
      throw new Error('Destination subject does not exist or access was denied.');
    }

    // 2. Perform Layered File Validation (Extension, MIME, Size, Signature)
    const validation = await fileValidationService.validatePdfFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid PDF file.');
    }

    // 3. Normalize & Sanitize Title
    let title = sanitizeTitle(rawTitle);
    if (!title) {
      // Default to file name without .pdf
      title = file.name.replace(/\.pdf$/i, '').trim() || 'Untitled Note';
    }

    // 4. Save into Repository
    return repositories.noteRepo.create(
      {
        userId,
        subjectId,
        title,
        fileName: file.name,
        fileSize: file.size,
        fileType: 'application/pdf',
      },
      file
    );
  }

  async renameNote(userId: string, id: string, newTitle: string): Promise<Note> {
    const title = sanitizeTitle(newTitle);
    if (!title) {
      throw new Error('Note title cannot be empty.');
    }

    return repositories.noteRepo.update(id, userId, { title });
  }

  async moveNote(userId: string, id: string, targetSubjectId: string): Promise<Note> {
    const subject = await repositories.subjectRepo.getById(targetSubjectId, userId);
    if (!subject) {
      throw new Error('Target subject not found.');
    }

    return repositories.noteRepo.update(id, userId, { subjectId: targetSubjectId });
  }

  async deleteNote(userId: string, id: string): Promise<boolean> {
    if (!userId || !id) return false;
    return repositories.noteRepo.delete(id, userId);
  }

  async getNoteFileBlob(userId: string, id: string): Promise<Blob | null> {
    if (!userId || !id) return null;
    return repositories.noteRepo.getFileBlob(id, userId);
  }

  async getRecentNotes(userId: string, limit = 8): Promise<Note[]> {
    if (!userId) return [];
    const notes = await repositories.noteRepo.getAll(userId);
    return notes.slice(0, limit);
  }

  async downloadNote(userId: string, id: string): Promise<void> {
    const note = await this.getNoteById(userId, id);
    if (!note) {
      throw new Error('Note not found.');
    }

    const blob = await this.getNoteFileBlob(userId, id);
    if (!blob) {
      throw new Error('PDF file data not found in cloud storage.');
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = note.fileName.endsWith('.pdf') ? note.fileName : `${note.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  sortNotes(notes: Note[], option: NoteSortOption): Note[] {
    const copy = [...notes];
    switch (option) {
      case 'newest':
        return copy.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return copy.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'name-asc':
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return copy.sort((a, b) => b.title.localeCompare(a.title));
      case 'size-desc':
        return copy.sort((a, b) => b.fileSize - a.fileSize);
      default:
        return copy;
    }
  }
}

export const noteService = new NoteService();
