export type ReadingTheme = 'light' | 'dark' | 'sepia';

const STARRED_NOTES_KEY = 'notenest_starred_notes';
const STUDY_NOTES_PREFIX = 'notenest_study_notes_';
const LAST_PAGE_PREFIX = 'notenest_last_page_';
const PREFERRED_THEME_KEY = 'notenest_preferred_theme';

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
};
