import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userPreferences } from '../src/services/userPreferences';
import { playPomodoroChime } from '../src/utils/sound';

describe('Top Academic App Features: Flashcards & Active Recall', () => {
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

  it('correctly parses RemNote style (Concept :: Definition) cards from notes', () => {
    const markdown = `
      # Physics Chapter 4
      Newton's First Law :: An object remains at rest unless acted upon by a net force.
      - Ohm's Law :: V = I * R
      Work :: Force multiplied by distance
    `;

    const parsed = userPreferences.parseFlashcardsFromText(markdown);
    expect(parsed.length).toBe(3);
    expect(parsed[0].question).toBe("Newton's First Law");
    expect(parsed[0].answer).toBe('An object remains at rest unless acted upon by a net force.');
    expect(parsed[1].question).toBe("Ohm's Law");
    expect(parsed[1].answer).toBe('V = I * R');
    expect(parsed[2].question).toBe('Work');
    expect(parsed[2].answer).toBe('Force multiplied by distance');
  });

  it('correctly parses Q: ... A: ... style cards from notes', () => {
    const text = `
      Q: What is the mitochondria? A: The powerhouse of the cell.
      - Question: What is DNA? Answer: Deoxyribonucleic acid.
    `;

    const parsed = userPreferences.parseFlashcardsFromText(text);
    expect(parsed.length).toBe(2);
    expect(parsed[0].question).toBe('What is the mitochondria?');
    expect(parsed[0].answer).toBe('The powerhouse of the cell.');
    expect(parsed[1].question).toBe('What is DNA?');
    expect(parsed[1].answer).toBe('Deoxyribonucleic acid.');
  });

  it('adds manual flashcard and manages mastery toggle', () => {
    const noteId = 'test-note-1';
    expect(userPreferences.getFlashcards(noteId)).toEqual([]);

    const card = userPreferences.addFlashcard(
      noteId,
      'What is gravity?',
      'A fundamental interaction causing mutual attraction between masses.'
    );

    expect(card.id).toBeDefined();
    expect(card.mastered).toBe(false);
    expect(card.reviewCount).toBe(0);

    const isMastered = userPreferences.toggleCardMastered(noteId, card.id);
    expect(isMastered).toBe(true);

    const cards = userPreferences.getFlashcards(noteId);
    expect(cards[0].mastered).toBe(true);
    expect(cards[0].reviewCount).toBe(1);

    userPreferences.deleteFlashcard(noteId, card.id);
    expect(userPreferences.getFlashcards(noteId)).toEqual([]);
  });

  it('imports extracted cards without creating duplicates', () => {
    const noteId = 'note-extract-test';
    const pairs = [
      { question: 'Topic A', answer: 'Definition A' },
      { question: 'Topic B', answer: 'Definition B' },
    ];

    const addedFirst = userPreferences.importExtractedCards(noteId, pairs);
    expect(addedFirst).toBe(2);

    // Re-importing same pairs should add 0 new cards
    const addedSecond = userPreferences.importExtractedCards(noteId, pairs);
    expect(addedSecond).toBe(0);

    const all = userPreferences.getFlashcards(noteId);
    expect(all.length).toBe(2);
  });
});

describe('Academic Study Stats & Streak Engine', () => {
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

  it('initializes default study stats and updates activity', () => {
    const initial = userPreferences.getStudyStats();
    expect(initial.streakDays).toBeGreaterThanOrEqual(1);
    expect(initial.totalPagesRead).toBeGreaterThanOrEqual(1);

    const updated = userPreferences.recordStudyActivity(5, 2);
    expect(updated.totalPagesRead).toBe(initial.totalPagesRead + 5);
    expect(updated.cardsMastered).toBe(initial.cardsMastered + 2);
  });
});

describe('Document Bookmarks & Page Citations', () => {
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

  it('creates and deletes page bookmarks', () => {
    const noteId = 'doc-99';
    expect(userPreferences.getBookmarks(noteId)).toEqual([]);

    const bm = userPreferences.addBookmark(noteId, 4, 'Exam Theorem');
    expect(bm.id).toBeDefined();
    expect(bm.pageNum).toBe(4);
    expect(bm.label).toBe('Exam Theorem');

    const list = userPreferences.getBookmarks(noteId);
    expect(list.length).toBe(1);

    userPreferences.deleteBookmark(noteId, bm.id);
    expect(userPreferences.getBookmarks(noteId)).toEqual([]);
  });
});

describe('Web Audio Pomodoro Chime Safety', () => {
  it('executes playPomodoroChime safely without throwing errors in headless environment', () => {
    expect(() => playPomodoroChime()).not.toThrow();
  });
});
