export type ReadingTheme = 'light' | 'dark' | 'sepia';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  mastered: boolean;
  reviewCount: number;
  lastReviewed?: string;
}

export interface StudyStats {
  streakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
  totalPagesRead: number;
  cardsMastered: number;
}

export interface NoteBookmark {
  id: string;
  pageNum: number;
  label: string;
  createdAt: string;
}

const STARRED_NOTES_KEY = 'notenest_starred_notes';
const STUDY_NOTES_PREFIX = 'notenest_study_notes_';
const LAST_PAGE_PREFIX = 'notenest_last_page_';
const PREFERRED_THEME_KEY = 'notenest_preferred_theme';
const FLASHCARDS_PREFIX = 'notenest_flashcards_';
const STUDY_STATS_KEY = 'notenest_study_stats';
const BOOKMARKS_PREFIX = 'notenest_bookmarks_';

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const userPreferences = {
  // Starred Notes
  getStarredNoteIds(): string[] {
    try {
      const raw = localStorage.getItem(STARRED_NOTES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  isNoteStarred(noteId: string): boolean {
    const list = this.getStarredNoteIds();
    return list.includes(noteId);
  },

  toggleNoteStarred(noteId: string): boolean {
    const list = this.getStarredNoteIds();
    const index = list.indexOf(noteId);
    let isStarred = false;

    if (index >= 0) {
      list.splice(index, 1);
      isStarred = false;
    } else {
      list.push(noteId);
      isStarred = true;
    }

    try {
      localStorage.setItem(STARRED_NOTES_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to persist starred notes to localStorage:', e);
    }

    return isStarred;
  },

  // Document Study Notes / Scratchpad
  getStudyNotes(noteId: string): string {
    try {
      return localStorage.getItem(`${STUDY_NOTES_PREFIX}${noteId}`) || '';
    } catch {
      return '';
    }
  },

  saveStudyNotes(noteId: string, content: string): void {
    try {
      localStorage.setItem(`${STUDY_NOTES_PREFIX}${noteId}`, content);
    } catch (e) {
      console.warn('Failed to persist study notes:', e);
    }
  },

  // Last Read Page Auto-Resume
  getLastReadPage(noteId: string): number {
    try {
      const val = localStorage.getItem(`${LAST_PAGE_PREFIX}${noteId}`);
      const page = val ? parseInt(val, 10) : 1;
      return isNaN(page) || page < 1 ? 1 : page;
    } catch {
      return 1;
    }
  },

  saveLastReadPage(noteId: string, page: number): void {
    if (page < 1) return;
    try {
      localStorage.setItem(`${LAST_PAGE_PREFIX}${noteId}`, String(page));
      // Also register study activity (pages read)
      this.recordStudyActivity(1, 0);
    } catch (e) {
      console.warn('Failed to persist last read page:', e);
    }
  },

  // Preferred Canvas Theme
  getPreferredTheme(): ReadingTheme {
    try {
      const theme = localStorage.getItem(PREFERRED_THEME_KEY);
      if (theme === 'dark' || theme === 'sepia') return theme;
      return 'light';
    } catch {
      return 'light';
    }
  },

  setPreferredTheme(theme: ReadingTheme): void {
    try {
      localStorage.setItem(PREFERRED_THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to persist preferred theme:', e);
    }
  },

  // -------------------------------------------------------------
  // 🗂️ Active Recall & Flashcards (RemNote / MarginNote inspired)
  // -------------------------------------------------------------
  getFlashcards(noteId: string): Flashcard[] {
    try {
      const raw = localStorage.getItem(`${FLASHCARDS_PREFIX}${noteId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveFlashcards(noteId: string, cards: Flashcard[]): void {
    try {
      localStorage.setItem(`${FLASHCARDS_PREFIX}${noteId}`, JSON.stringify(cards));
    } catch (e) {
      console.warn('Failed to persist flashcards:', e);
    }
  },

  addFlashcard(noteId: string, question: string, answer: string): Flashcard {
    const cards = this.getFlashcards(noteId);
    const newCard: Flashcard = {
      id: `fc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      question: question.trim(),
      answer: answer.trim(),
      mastered: false,
      reviewCount: 0,
    };
    cards.push(newCard);
    this.saveFlashcards(noteId, cards);
    return newCard;
  },

  toggleCardMastered(noteId: string, cardId: string): boolean {
    const cards = this.getFlashcards(noteId);
    const card = cards.find((c) => c.id === cardId);
    if (!card) return false;

    card.mastered = !card.mastered;
    card.reviewCount += 1;
    card.lastReviewed = new Date().toISOString();

    this.saveFlashcards(noteId, cards);

    // Update global study stats
    if (card.mastered) {
      this.recordStudyActivity(0, 1);
    }
    return card.mastered;
  },

  deleteFlashcard(noteId: string, cardId: string): void {
    const cards = this.getFlashcards(noteId);
    const filtered = cards.filter((c) => c.id !== cardId);
    this.saveFlashcards(noteId, filtered);
  },

  // Auto-parse Flashcards from text (RemNote syntax or Q: ... A: ...)
  parseFlashcardsFromText(text: string): { question: string; answer: string }[] {
    const pairs: { question: string; answer: string }[] = [];
    if (!text || typeof text !== 'string') return pairs;

    const lines = text.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // 1. RemNote style: Concept :: Definition
      if (line.includes('::')) {
        const parts = line.split('::');
        if (parts.length >= 2) {
          const q = parts[0].replace(/^[-*#\s]+/, '').trim();
          const a = parts.slice(1).join('::').trim();
          if (q.length > 0 && a.length > 0) {
            pairs.push({ question: q, answer: a });
            continue;
          }
        }
      }

      // 2. Q: ... A: ... style on a single line
      const qaRegex = /^(?:[-*#\s]*)(?:Q|Question):\s*(.+?)\s*(?:A|Answer):\s*(.+)$/i;
      const match = line.match(qaRegex);
      if (match && match[1] && match[2]) {
        pairs.push({ question: match[1].trim(), answer: match[2].trim() });
        continue;
      }
    }

    return pairs;
  },

  importExtractedCards(noteId: string, pairs: { question: string; answer: string }[]): number {
    if (!pairs.length) return 0;
    const existing = this.getFlashcards(noteId);
    let addedCount = 0;

    for (const pair of pairs) {
      // Avoid duplicate questions in the same note
      const exists = existing.some(
        (c) => c.question.toLowerCase() === pair.question.toLowerCase()
      );
      if (!exists) {
        existing.push({
          id: `fc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          question: pair.question,
          answer: pair.answer,
          mastered: false,
          reviewCount: 0,
        });
        addedCount += 1;
      }
    }

    if (addedCount > 0) {
      this.saveFlashcards(noteId, existing);
    }
    return addedCount;
  },

  // -------------------------------------------------------------
  // 📊 Academic Health, Streaks & Study Hub (Scholarcy inspired)
  // -------------------------------------------------------------
  getStudyStats(): StudyStats {
    try {
      const raw = localStorage.getItem(STUDY_STATS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }

    const defaultStats: StudyStats = {
      streakDays: 1,
      lastStudyDate: getTodayString(),
      totalPagesRead: 1,
      cardsMastered: 0,
    };
    return defaultStats;
  },

  recordStudyActivity(pagesDelta = 0, cardsDelta = 0): StudyStats {
    const stats = this.getStudyStats();
    const today = getTodayString();
    const yesterday = getYesterdayString();

    if (stats.lastStudyDate === today) {
      // Already studied today, maintain streak
    } else if (stats.lastStudyDate === yesterday) {
      // Studied yesterday, increment streak!
      stats.streakDays += 1;
      stats.lastStudyDate = today;
    } else {
      // Gap of more than 1 day, reset streak to 1
      stats.streakDays = 1;
      stats.lastStudyDate = today;
    }

    stats.totalPagesRead += Math.max(0, pagesDelta);
    stats.cardsMastered += Math.max(0, cardsDelta);

    try {
      localStorage.setItem(STUDY_STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to persist study stats:', e);
    }

    return stats;
  },

  // -------------------------------------------------------------
  // 📌 Page Bookmarks & Excerpt Markers (LiquidText inspired)
  // -------------------------------------------------------------
  getBookmarks(noteId: string): NoteBookmark[] {
    try {
      const raw = localStorage.getItem(`${BOOKMARKS_PREFIX}${noteId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addBookmark(noteId: string, pageNum: number, label: string): NoteBookmark {
    const list = this.getBookmarks(noteId);
    const item: NoteBookmark = {
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      pageNum: Math.max(1, pageNum),
      label: label.trim() || `Page ${pageNum}`,
      createdAt: new Date().toISOString(),
    };
    list.push(item);
    try {
      localStorage.setItem(`${BOOKMARKS_PREFIX}${noteId}`, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to persist bookmark:', e);
    }
    return item;
  },

  deleteBookmark(noteId: string, bookmarkId: string): void {
    const list = this.getBookmarks(noteId);
    const filtered = list.filter((b) => b.id !== bookmarkId);
    try {
      localStorage.setItem(`${BOOKMARKS_PREFIX}${noteId}`, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to delete bookmark:', e);
    }
  },
};
