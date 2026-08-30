import { Note } from '@/types/note';
import { INoteRepository } from '@/types/repository';
import { supabase } from '@/lib/supabase';
import { supabaseStorageRepo } from './supabaseStorageRepo';

interface SupabaseNoteRow {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  mime_type?: string;
  file_type?: string;
  created_at: string;
  updated_at: string;
}

function mapRowToNote(row: SupabaseNoteRow): Note {
  const path = row.storage_path;
  const mime = row.mime_type || row.file_type || 'application/pdf';
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    title: row.title || row.file_name,
    fileName: row.file_name,
    filePath: path,
    storagePath: path,
    fileSize: Number(row.file_size),
    fileType: mime,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseNoteRepository implements INoteRepository {
  async getAll(userId: string, subjectId?: string): Promise<Note[]> {
    if (!supabase) return [];

    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch notes from Supabase:', error);
      throw new Error(`Database error fetching notes: ${error.message}`);
    }

    return (data as SupabaseNoteRow[]).map(mapRowToNote);
  }

  async getById(id: string, userId: string): Promise<Note | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch note from Supabase:', error);
      return null;
    }

    return data ? mapRowToNote(data as SupabaseNoteRow) : null;
  }

  async create(
    noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
    fileBlob: Blob
  ): Promise<Note> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    // 1. Upload PDF Blob to Cloud Storage with collision-resistant path
    const storagePath = await supabaseStorageRepo.uploadFile(
      noteData.userId,
      noteData.subjectId,
      fileBlob
    );

    // 2. Insert metadata record in PostgreSQL
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: noteData.userId,
        subject_id: noteData.subjectId,
        title: noteData.title,
        file_name: noteData.fileName,
        storage_path: storagePath,
        file_size: noteData.fileSize,
        mime_type: noteData.fileType || 'application/pdf',
      })
      .select()
      .single();

    if (error || !data) {
      // Rollback uploaded file if DB insert fails
      await supabaseStorageRepo.deleteFile(storagePath);
      throw new Error(`Failed to save note record in database: ${error?.message}`);
    }

    return mapRowToNote(data as SupabaseNoteRow);
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Pick<Note, 'title' | 'subjectId'>>
  ): Promise<Note> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId;

    const { data, error } = await supabase
      .from('notes')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update note in database: ${error?.message}`);
    }

    return mapRowToNote(data as SupabaseNoteRow);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!supabase) return false;

    const existing = await this.getById(id, userId);
    if (!existing) return false;

    // Delete DB record
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete note from database: ${error.message}`);
    }

    // Delete storage file if path exists
    const path = existing.storagePath || existing.filePath;
    if (path) {
      await supabaseStorageRepo.deleteFile(path);
    }

    return true;
  }

  async deleteBySubject(subjectId: string, userId: string): Promise<number> {
    if (!supabase) return 0;

    const notesInSubject = await this.getAll(userId, subjectId);
    if (notesInSubject.length === 0) return 0;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('subject_id', subjectId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete subject notes: ${error.message}`);
    }

    // Clean up storage folder
    await supabaseStorageRepo.deleteFolder(`${userId}/${subjectId}`);

    return notesInSubject.length;
  }

  async getFileBlob(id: string, userId: string): Promise<Blob | null> {
    const note = await this.getById(id, userId);
    const path = note?.storagePath || note?.filePath;
    if (!path) return null;

    return supabaseStorageRepo.downloadFile(path);
  }

  async countBySubject(subjectId: string, userId: string): Promise<number> {
    if (!supabase) return 0;

    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', subjectId)
      .eq('user_id', userId);

    if (error || count === null) {
      console.error('Error counting notes by subject:', error);
      return 0;
    }

    return count;
  }
}
