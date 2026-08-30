import { Subject } from './subject';
import { Note } from './note';
import { User } from './auth';

export interface ISubjectRepository {
  getAll(userId: string): Promise<Subject[]>;
  getById(id: string, userId: string): Promise<Subject | null>;
  create(subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject>;
  update(id: string, userId: string, updates: Partial<Pick<Subject, 'name' | 'colorId' | 'description'>>): Promise<Subject>;
  delete(id: string, userId: string): Promise<boolean>;
}

export interface INoteRepository {
  getAll(userId: string, subjectId?: string): Promise<Note[]>;
  getById(id: string, userId: string): Promise<Note | null>;
  create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, fileBlob: Blob): Promise<Note>;
  update(id: string, userId: string, updates: Partial<Pick<Note, 'title' | 'subjectId'>>): Promise<Note>;
  delete(id: string, userId: string): Promise<boolean>;
  deleteBySubject(subjectId: string, userId: string): Promise<number>;
  getFileBlob(id: string, userId: string): Promise<Blob | null>;
  countBySubject(subjectId: string, userId: string): Promise<number>;
}

export interface IAuthRepository {
  getCurrentUser(): Promise<User | null>;
  saveCurrentUser(user: User | null): Promise<void>;
  listUsers(): Promise<User[]>;
  saveUser(user: User): Promise<void>;
}
