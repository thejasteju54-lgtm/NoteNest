import { ISubjectRepository, INoteRepository, IAuthRepository } from '@/types/repository';
import { IndexedDBSubjectRepository } from './indexeddb/subjectRepo';
import { IndexedDBNoteRepository } from './indexeddb/noteRepo';
import { LocalDemoAuthRepository } from './auth/localAuthRepo';
import { SupabaseSubjectRepository } from './supabase/supabaseSubjectRepo';
import { SupabaseNoteRepository } from './supabase/supabaseNoteRepo';
import { isSupabaseConfigured } from '@/lib/supabase';

// Central Repository Container (Dependency Injection pattern)
export interface Repositories {
  subjectRepo: ISubjectRepository;
  noteRepo: INoteRepository;
  authRepo: IAuthRepository;
}

const useSupabase = isSupabaseConfigured();

export const repositories: Repositories = {
  subjectRepo: useSupabase ? new SupabaseSubjectRepository() : new IndexedDBSubjectRepository(),
  noteRepo: useSupabase ? new SupabaseNoteRepository() : new IndexedDBNoteRepository(),
  authRepo: new LocalDemoAuthRepository(),
};
