import { describe, it, expect, beforeEach, vi } from 'vitest';
import { withRetry } from '../src/utils/retry';
import { userPreferences } from '../src/services/userPreferences';

describe('withRetry Utility', () => {
  it('returns value immediately on first attempt if successful', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxAttempts: 3 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and returns when subsequent attempt succeeds', async () => {
    let attempts = 0;
    const fn = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Transient network error');
      }
      return 'recovered';
    });

    const result = await withRetry(fn, {
      maxAttempts: 3,
      initialDelayMs: 10,
      backoffFactor: 1.5,
    });

    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws final error when max attempts are exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Persistent server failure'));

    await expect(
      withRetry(fn, {
        maxAttempts: 2,
        initialDelayMs: 5,
      })
    ).rejects.toThrow('Persistent server failure');

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry when shouldRetry returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('404 Not Found'));

    await expect(
      withRetry(fn, {
        maxAttempts: 3,
        initialDelayMs: 10,
        shouldRetry: (err) => err instanceof Error && !err.message.includes('404'),
      })
    ).rejects.toThrow('404 Not Found');

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('userPreferences Local-First Service', () => {
  const store = new Map<string, string>();
  const mockLocalStorage = {
    getItem: (k: string) => store.get(k) || null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage);
    localStorage.clear();
  });

  it('manages starred notes state correctly', () => {
    expect(userPreferences.isNoteStarred('note-123')).toBe(false);

    const starred = userPreferences.toggleNoteStarred('note-123');
    expect(starred).toBe(true);
    expect(userPreferences.isNoteStarred('note-123')).toBe(true);
    expect(userPreferences.getStarredNoteIds()).toEqual(['note-123']);

    const unstarred = userPreferences.toggleNoteStarred('note-123');
    expect(unstarred).toBe(false);
    expect(userPreferences.isNoteStarred('note-123')).toBe(false);
    expect(userPreferences.getStarredNoteIds()).toEqual([]);
  });

  it('persists and retrieves study notes per note ID', () => {
    expect(userPreferences.getStudyNotes('note-abc')).toBe('');

    userPreferences.saveStudyNotes('note-abc', 'Exam reminder: review theorem 3');
    expect(userPreferences.getStudyNotes('note-abc')).toBe(
      'Exam reminder: review theorem 3'
    );
  });

  it('persists and retrieves last read page with bounds check', () => {
    expect(userPreferences.getLastReadPage('note-xyz')).toBe(1);

    userPreferences.saveLastReadPage('note-xyz', 14);
    expect(userPreferences.getLastReadPage('note-xyz')).toBe(14);

    // Negative page values are ignored
    userPreferences.saveLastReadPage('note-xyz', -5);
    expect(userPreferences.getLastReadPage('note-xyz')).toBe(14);
  });

  it('persists reading themes correctly', () => {
    expect(userPreferences.getPreferredTheme()).toBe('light');

    userPreferences.setPreferredTheme('dark');
    expect(userPreferences.getPreferredTheme()).toBe('dark');

    userPreferences.setPreferredTheme('sepia');
    expect(userPreferences.getPreferredTheme()).toBe('sepia');
  });
});
