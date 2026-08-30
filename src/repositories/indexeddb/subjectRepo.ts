import { Subject } from '@/types/subject';
import { ISubjectRepository } from '@/types/repository';
import { STORES, withTransaction } from './db';

export class IndexedDBSubjectRepository implements ISubjectRepository {
  async getAll(userId: string): Promise<Subject[]> {
    return withTransaction([STORES.SUBJECTS], 'readonly', async (tx) => {
      const store = tx.objectStore(STORES.SUBJECTS);
      const index = store.index('userId');
      
      return new Promise<Subject[]>((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(userId));
        request.onsuccess = () => {
          const subjects = (request.result || []) as Subject[];
          // Sort by creation date descending
          subjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          resolve(subjects);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getById(id: string, userId: string): Promise<Subject | null> {
    return withTransaction([STORES.SUBJECTS], 'readonly', async (tx) => {
      const store = tx.objectStore(STORES.SUBJECTS);
      
      return new Promise<Subject | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          const subject = request.result as Subject | undefined;
          if (subject && subject.userId === userId) {
            resolve(subject);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async create(subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> {
    const now = new Date().toISOString();
    const newSubject: Subject = {
      ...subjectData,
      id: `subj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    return withTransaction([STORES.SUBJECTS], 'readwrite', async (tx) => {
      const store = tx.objectStore(STORES.SUBJECTS);
      
      return new Promise<Subject>((resolve, reject) => {
        const request = store.add(newSubject);
        request.onsuccess = () => resolve(newSubject);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Pick<Subject, 'name' | 'colorId' | 'description'>>
  ): Promise<Subject> {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error(`Subject not found or access denied: ${id}`);
    }

    const updatedSubject: Subject = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return withTransaction([STORES.SUBJECTS], 'readwrite', async (tx) => {
      const store = tx.objectStore(STORES.SUBJECTS);
      
      return new Promise<Subject>((resolve, reject) => {
        const request = store.put(updatedSubject);
        request.onsuccess = () => resolve(updatedSubject);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.getById(id, userId);
    if (!existing) {
      return false;
    }

    return withTransaction([STORES.SUBJECTS], 'readwrite', async (tx) => {
      const store = tx.objectStore(STORES.SUBJECTS);
      
      return new Promise<boolean>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    });
  }
}
