import { Subject } from '@/types/subject';
import { ISubjectRepository } from '@/types/repository';
import { supabase } from '@/lib/supabase';

interface SupabaseSubjectRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToSubject(row: SupabaseSubjectRow): Subject {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    colorId: row.color || 'sage',
    description: row.description || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseSubjectRepository implements ISubjectRepository {
  async getAll(userId: string): Promise<Subject[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch subjects from Supabase:', error);
      throw new Error(`Database error fetching subjects: ${error.message}`);
    }

    return (data as SupabaseSubjectRow[]).map(mapRowToSubject);
  }

  async getById(id: string, userId: string): Promise<Subject | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch subject from Supabase:', error);
      return null;
    }

    return data ? mapRowToSubject(data as SupabaseSubjectRow) : null;
  }

  async create(subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: subjectData.userId,
        name: subjectData.name,
        color: subjectData.colorId || 'sage',
        description: subjectData.description || null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create subject in database: ${error?.message}`);
    }

    return mapRowToSubject(data as SupabaseSubjectRow);
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Pick<Subject, 'name' | 'colorId' | 'description'>>
  ): Promise<Subject> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.colorId !== undefined) payload.color = updates.colorId;
    if (updates.description !== undefined) payload.description = updates.description;

    const { data, error } = await supabase
      .from('subjects')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update subject in database: ${error?.message}`);
    }

    return mapRowToSubject(data as SupabaseSubjectRow);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to delete subject from Supabase:', error);
      throw new Error(`Database error deleting subject: ${error.message}`);
    }

    return true;
  }
}
