import { ISubjectRepository, INoteRepository, IAuthRepository } from '@/types/repository';
import { IndexedDBSubjectRepository } from './indexeddb/subjectRepo';
import { IndexedDBNoteRepository } from './indexeddb/noteRepo';
import { LocalDemoAuthRepository } from './auth/localAuthRepo';

// Central Repository Container (Dependency Injection pattern)
export interface Repositories {
  subjectRepo: ISubjectRepository;
  noteRepo: INoteRepository;
  authRepo: IAuthRepository;
}

export const repositories: Repositories = {
  subjectRepo: new IndexedDBSubjectRepository(),
  noteRepo: new IndexedDBNoteRepository(),
  authRepo: new LocalDemoAuthRepository(),
};
