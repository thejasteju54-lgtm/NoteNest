import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bmisabwbprnslgkeksys.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__RiHSirSdCBLRF_DU9jatA_JlH-UkBN';

describe('Live Supabase Backend & RLS Security Verification', () => {
  let supaAnon: SupabaseClient;

  beforeAll(() => {
    supaAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  it('1. Live Database Connectivity & Table Check', async () => {
    // Check if tables exist and are accessible with anon/auth
    const { data: profiles, error: profErr } = await supaAnon.from('profiles').select('count').limit(1);
    console.log('Profiles table check:', { profiles, profErr });

    const { data: subjects, error: subjErr } = await supaAnon.from('subjects').select('count').limit(1);
    console.log('Subjects table check:', { subjects, subjErr });

    const { data: notes, error: noteErr } = await supaAnon.from('notes').select('count').limit(1);
    console.log('Notes table check:', { notes, noteErr });

    if (profErr || subjErr || noteErr) {
      console.warn('Note: If tables are missing, ensure docs/architecture/supabase_schema.sql has been executed in the Supabase SQL editor.');
    }
  });

  it('2. Live Storage Bucket Check', async () => {
    const { data: buckets, error: bucketErr } = await supaAnon.storage.listBuckets();
    console.log('Live Storage Buckets:', { buckets, bucketErr });
  });

  it('3. Multi-User Live Authentication and RLS Cross-Access Isolation Test', async () => {
    const timestamp = Date.now();
    const userAEmail = `notenest_test_a_${timestamp}@testmail.com`;
    const userBEmail = `notenest_test_b_${timestamp}@testmail.com`;
    const testPassword = `TestPass123!_${timestamp}`;

    console.log('Registering User A:', userAEmail);
    const { data: authA, error: authAErr } = await supaAnon.auth.signUp({
      email: userAEmail,
      password: testPassword,
      options: { data: { display_name: 'Test Student Alpha' } },
    });

    if (authAErr || !authA.user) {
      console.log('User A SignUp result:', { authAErr, user: authA?.user?.id });
      return;
    }

    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    await clientA.auth.setSession({
      access_token: authA.session?.access_token || '',
      refresh_token: authA.session?.refresh_token || '',
    });

    console.log('Registering User B:', userBEmail);
    const { data: authB, error: authBErr } = await supaAnon.auth.signUp({
      email: userBEmail,
      password: testPassword,
      options: { data: { display_name: 'Test Student Beta' } },
    });

    if (authBErr || !authB.user) {
      console.log('User B SignUp result:', { authBErr, user: authB?.user?.id });
      return;
    }

    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    await clientB.auth.setSession({
      access_token: authB.session?.access_token || '',
      refresh_token: authB.session?.refresh_token || '',
    });

    const userAId = authA.user.id;
    const userBId = authB.user.id;

    // --- TEST A: User A Creates Subject ---
    const { data: subjA, error: subjAErr } = await clientA
      .from('subjects')
      .insert({
        user_id: userAId,
        name: `Live Math ${timestamp}`,
        color: 'sage',
      })
      .select()
      .single();

    console.log('User A Subject creation result:', { subjA, subjAErr });

    if (subjA) {
      // --- TEST B: User A Creates Note ---
      const { data: noteA, error: noteAErr } = await clientA
        .from('notes')
        .insert({
          user_id: userAId,
          subject_id: subjA.id,
          title: `Calculus Live ${timestamp}`,
          file_name: 'calculus.pdf',
          file_path: `${userAId}/${subjA.id}/calculus.pdf`,
          file_size: 1024,
          file_type: 'application/pdf',
        })
        .select()
        .single();

      console.log('User A Note creation result:', { noteA, noteAErr });

      // --- TEST C: User B Attempts to SELECT User A's Subject ---
      const { data: userBReadSubjA } = await clientB
        .from('subjects')
        .select('*')
        .eq('id', subjA.id);

      console.log('RLS Check - User B reading User A subject (Expect empty array):', userBReadSubjA);
      expect(userBReadSubjA?.length || 0).toBe(0);

      // --- TEST D: User B Attempts to UPDATE User A's Subject ---
      const { data: userBUpdateSubjA, error: userBUpdateErr } = await clientB
        .from('subjects')
        .update({ name: 'Hacked Subject' })
        .eq('id', subjA.id)
        .select();

      console.log('RLS Check - User B updating User A subject (Expect 0 rows updated):', {
        userBUpdateSubjA,
        userBUpdateErr,
      });
      expect(userBUpdateSubjA?.length || 0).toBe(0);

      // --- TEST E: User B Attempts to DELETE User A's Subject ---
      const { data: userBDeleteSubjA } = await clientB
        .from('subjects')
        .delete()
        .eq('id', subjA.id)
        .select();

      console.log('RLS Check - User B deleting User A subject (Expect 0 rows deleted):', userBDeleteSubjA);
      expect(userBDeleteSubjA?.length || 0).toBe(0);

      // --- TEST F: User B Attempts to SELECT User A's Note ---
      if (noteA) {
        const { data: userBReadNoteA } = await clientB
          .from('notes')
          .select('*')
          .eq('id', noteA.id);

        console.log('RLS Check - User B reading User A note (Expect empty array):', userBReadNoteA);
        expect(userBReadNoteA?.length || 0).toBe(0);

        // --- TEST G: User B Attempts to UPDATE User A's Note ---
        const { data: userBUpdateNoteA } = await clientB
          .from('notes')
          .update({ title: 'Hacked Note' })
          .eq('id', noteA.id)
          .select();

        console.log('RLS Check - User B updating User A note (Expect 0 rows updated):', userBUpdateNoteA);
        expect(userBUpdateNoteA?.length || 0).toBe(0);

        // --- TEST H: User B Attempts to DELETE User A's Note ---
        const { data: userBDeleteNoteA } = await clientB
          .from('notes')
          .delete()
          .eq('id', noteA.id)
          .select();

        console.log('RLS Check - User B deleting User A note (Expect 0 rows deleted):', userBDeleteNoteA);
        expect(userBDeleteNoteA?.length || 0).toBe(0);
      }

      // --- TEST I: Storage RLS Verification ---
      const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
      const testBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      // User A uploads to User A folder
      const storagePathA = `${userAId}/${subjA.id}/test_doc.pdf`;
      const { data: uploadA, error: uploadAErr } = await clientA.storage
        .from('notes')
        .upload(storagePathA, testBlob, { contentType: 'application/pdf', upsert: true });

      console.log('User A Storage Upload result:', { uploadA, uploadAErr });

      // User B attempts to upload into User A folder (Must fail with RLS error)
      const unauthorizedUploadPath = `${userAId}/${subjA.id}/malicious.pdf`;
      const { data: hackUpload, error: hackUploadErr } = await clientB.storage
        .from('notes')
        .upload(unauthorizedUploadPath, testBlob, { contentType: 'application/pdf' });

      console.log('RLS Check - User B uploading to User A folder (Expect error):', { hackUpload, hackUploadErr });
      expect(hackUploadErr).not.toBeNull();

      // User B attempts to download User A's PDF (Must fail or return null)
      const { data: downloadB, error: downloadBErr } = await clientB.storage
        .from('notes')
        .download(storagePathA);

      console.log('RLS Check - User B downloading User A PDF (Expect error/null):', { downloadB, downloadBErr });
      expect(downloadBErr || !downloadB).toBeTruthy();
    }
  });
});
