import { Note } from '@/types/note';
import { INoteRepository } from '@/types/repository';
import { STORES, withTransaction } from './db';

interface FileRecord {
  id: string; // noteId
  userId: string;
  blob: Blob;
  createdAt: string;
}

export class IndexedDBNoteRepository implements INoteRepository {
  async getAll(userId: string, subjectId?: string): Promise<Note[]> {
    return withTransaction([STORES.NOTES], 'readonly', async (tx) => {
      const store = tx.objectStore(STORES.NOTES);
      
      return new Promise<Note[]>((resolve, reject) => {
        let request: IDBRequest;

        if (subjectId) {
          const index = store.index('userId_subjectId');
          request = index.getAll(IDBKeyRange.only([userId, subjectId]));
        } else {
          const index = store.index('userId');
          request = index.getAll(IDBKeyRange.only(userId));
        }

        request.onsuccess = () => {
          const notes = (request.result || []) as Note[];
          // Sort by creation date descending
          notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          resolve(notes);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getById(id: string, userId: string): Promise<Note | null> {
    return withTransaction([STORES.NOTES], 'readonly', async (tx) => {
      const store = tx.objectStore(STORES.NOTES);
      
      return new Promise<Note | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          const note = request.result as Note | undefined;
          if (note && note.userId === userId) {
            resolve(note);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async create(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, fileBlob: Blob): Promise<Note> {
    const now = new Date().toISOString();
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newNote: Note = {
      ...noteData,
      id: noteId,
      createdAt: now,
      updatedAt: now,
    };

    const fileRecord: FileRecord = {
      id: noteId,
      userId: noteData.userId,
      blob: fileBlob,
      createdAt: now,
    };

    return withTransaction([STORES.NOTES, STORES.FILES], 'readwrite', async (tx) => {
      const noteStore = tx.objectStore(STORES.NOTES);
      const fileStore = tx.objectStore(STORES.FILES);

      return new Promise<Note>((resolve, reject) => {
        const noteRequest = noteStore.add(newNote);
        noteRequest.onerror = () => reject(noteRequest.error);

        const fileRequest = fileStore.add(fileRecord);
        fileRequest.onerror = () => reject(fileRequest.error);

        // When both succeed in tx
        fileRequest.onsuccess = () => resolve(newNote);
      });
    });
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Pick<Note, 'title' | 'subjectId'>>
  ): Promise<Note> {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error(`Note not found or access denied: ${id}`);
    }

    const updatedNote: Note = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return withTransaction([STORES.NOTES], 'readwrite', async (tx) => {
      const store = tx.objectStore(STORES.NOTES);
      
      return new Promise<Note>((resolve, reject) => {
        const request = store.put(updatedNote);
        request.onsuccess = () => resolve(updatedNote);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.getById(id, userId);
    if (!existing) {
      return false;
    }

    return withTransaction([STORES.NOTES, STORES.FILES], 'readwrite', async (tx) => {
      const noteStore = tx.objectStore(STORES.NOTES);
      const fileStore = tx.objectStore(STORES.FILES);

      return new Promise<boolean>((resolve, reject) => {
        const noteReq = noteStore.delete(id);
        noteReq.onerror = () => reject(noteReq.error);

        const fileReq = fileStore.delete(id);
        fileReq.onerror = () => reject(fileReq.error);

        fileReq.onsuccess = () => resolve(true);
      });
    });
  }

  async deleteBySubject(subjectId: string, userId: string): Promise<number> {
    const notesInSubject = await this.getAll(userId, subjectId);
    if (notesInSubject.length === 0) return 0;

    return withTransaction([STORES.NOTES, STORES.FILES], 'readwrite', async (tx) => {
      const noteStore = tx.objectStore(STORES.NOTES);
      const fileStore = tx.objectStore(STORES.FILES);

      let deletedCount = 0;
      return new Promise<number>((resolve) => {
        for (const note of notesInSubject) {
          noteStore.delete(note.id);
          fileStore.delete(note.id);
          deletedCount++;
        }
        resolve(deletedCount);
      });
    });
  }

  async getFileBlob(id: string, userId: string): Promise<Blob | null> {
    return withTransaction([STORES.FILES], 'readonly', async (tx) => {
      const store = tx.objectStore(STORES.FILES);
      
      return new Promise<Blob | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          const record = request.result as FileRecord | undefined;
          if (record && record.userId === userId) {
            resolve(record.blob);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async countBySubject(subjectId: string, userId: string): Promise<number> {
    return withTransaction([STORES.NOTES], 'readonly', async (tx) => {
      const store = tx.objectStore(STORES.NOTES);
      const index = store.index('userId_subjectId');

      return new Promise<number>((resolve, reject) => {
        const request = index.count(IDBKeyRange.only([userId, subjectId]));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }
}
