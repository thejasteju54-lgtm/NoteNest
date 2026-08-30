import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Subject, SubjectWithNoteCount } from '@/types/subject';
import { Note } from '@/types/note';
import { ActivePage, SearchResults } from '@/types/common';
import { useAuth } from './AuthContext';
import { subjectService } from '@/services/subjectService';
import { noteService } from '@/services/noteService';
import { searchService } from '@/services/searchService';
import { useToast } from './ToastContext';

interface NoteNestContextValue {
  // State
  subjects: SubjectWithNoteCount[];
  recentNotes: (Note & { subjectName?: string; subjectColorId?: string })[];
  activePage: ActivePage;
  isLoading: boolean;
  searchQuery: string;
  searchResults: SearchResults | null;
  isSearching: boolean;

  // Modals state
  isUploadModalOpen: boolean;
  uploadTargetSubjectId?: string;
  isSubjectModalOpen: boolean;
  editingSubject?: Subject;
  previewNoteId: string | null;
  
  // Navigation & Modals actions
  navigateTo: (page: ActivePage) => void;
  openUploadModal: (subjectId?: string) => void;
  closeUploadModal: () => void;
  openSubjectModal: (subject?: Subject) => void;
  closeSubjectModal: () => void;
  openPreview: (noteId: string) => void;
  closePreview: () => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Data operations
  refreshData: () => Promise<void>;
  createSubject: (name: string, colorId?: string, description?: string) => Promise<Subject>;
  updateSubject: (id: string, name: string, colorId?: string, description?: string) => Promise<Subject>;
  deleteSubject: (id: string) => Promise<void>;
  uploadNote: (subjectId: string, title: string, file: File) => Promise<Note>;
  renameNote: (id: string, newTitle: string) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  downloadNote: (id: string) => Promise<void>;
}

const NoteNestContext = createContext<NoteNestContextValue | null>(null);

export const NoteNestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [subjects, setSubjects] = useState<SubjectWithNoteCount[]>([]);
  const [recentNotes, setRecentNotes] = useState<(Note & { subjectName?: string; subjectColorId?: string })[]>([]);
  const [activePage, setActivePage] = useState<ActivePage>({ type: 'dashboard' });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTargetSubjectId, setUploadTargetSubjectId] = useState<string | undefined>(undefined);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined);
  const [previewNoteId, setPreviewNoteId] = useState<string | null>(null);

  // Load / Refresh Data
  const refreshData = useCallback(async () => {
    if (!user) {
      setSubjects([]);
      setRecentNotes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [loadedSubjects, loadedRecent] = await Promise.all([
        subjectService.getSubjectsWithStats(user.id),
        noteService.getRecentNotes(user.id, 8),
      ]);

      const subjectMap = new Map<string, SubjectWithNoteCount>();
      loadedSubjects.forEach((s) => subjectMap.set(s.id, s));

      const enrichedRecent = loadedRecent.map((note) => {
        const parent = subjectMap.get(note.subjectId);
        return {
          ...note,
          subjectName: parent ? parent.name : 'Unknown Subject',
          subjectColorId: parent ? parent.colorId : 'sage',
        };
      });

      setSubjects(loadedSubjects);
      setRecentNotes(enrichedRecent);
    } catch (err) {
      console.error('Failed to load NoteNest data:', err);
      showError('Failed to load data', 'Could not load your subjects and notes from storage.');
    } finally {
      setIsLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle Search Debounce
  useEffect(() => {
    if (!user) return;
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchService.search(user.id, trimmed);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  // Navigation
  const navigateTo = useCallback((page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openUploadModal = useCallback((subjectId?: string) => {
    setUploadTargetSubjectId(subjectId);
    setIsUploadModalOpen(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setUploadTargetSubjectId(undefined);
  }, []);

  const openSubjectModal = useCallback((subject?: Subject) => {
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  }, []);

  const closeSubjectModal = useCallback(() => {
    setIsSubjectModalOpen(false);
    setEditingSubject(undefined);
  }, []);

  const openPreview = useCallback((noteId: string) => {
    setPreviewNoteId(noteId);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewNoteId(null);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
  }, []);

  // CRUD Operations
  const createSubject = async (name: string, colorId?: string, description?: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const created = await subjectService.createSubject(user.id, name, colorId, description);
      success('Subject created', `"${created.name}" is ready for notes.`);
      await refreshData();
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showError('Could not create subject', message);
      throw err;
    }
  };

  const updateSubject = async (id: string, name: string, colorId?: string, description?: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const updated = await subjectService.updateSubject(user.id, id, name, colorId, description);
      success('Subject updated', `Updated to "${updated.name}".`);
      await refreshData();
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showError('Could not update subject', message);
      throw err;
    }
  };

  const deleteSubject = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const target = subjects.find((s) => s.id === id);
      await subjectService.deleteSubject(user.id, id);
      success('Subject deleted', target ? `"${target.name}" and its notes were removed.` : undefined);
      
      // If we were viewing this subject, navigate back to dashboard
      if (activePage.type === 'subject' && activePage.subjectId === id) {
        navigateTo({ type: 'dashboard' });
      }
      await refreshData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showError('Could not delete subject', message);
      throw err;
    }
  };

  const uploadNote = async (subjectId: string, title: string, file: File) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const note = await noteService.uploadNote(user.id, subjectId, title, file);
      success('Note uploaded', `"${note.title}" saved successfully.`);
      await refreshData();
      return note;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'We could not upload your note. Please try again.';
      showError('Upload failed', message);
      throw err;
    }
  };

  const renameNote = async (id: string, newTitle: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const updated = await noteService.renameNote(user.id, id, newTitle);
      success('Note renamed', `Updated title to "${updated.title}".`);
      await refreshData();
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showError('Could not rename note', message);
      throw err;
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await noteService.deleteNote(user.id, id);
      success('Note deleted', 'The PDF note was removed.');
      await refreshData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showError('Could not delete note', message);
      throw err;
    }
  };

  const downloadNote = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await noteService.downloadNote(user.id, id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not download note file.';
      showError('Download failed', message);
    }
  };

  return (
    <NoteNestContext.Provider
      value={{
        subjects,
        recentNotes,
        activePage,
        isLoading,
        searchQuery,
        searchResults,
        isSearching,
        isUploadModalOpen,
        uploadTargetSubjectId,
        isSubjectModalOpen,
        editingSubject,
        previewNoteId,
        navigateTo,
        openUploadModal,
        closeUploadModal,
        openSubjectModal,
        closeSubjectModal,
        openPreview,
        closePreview,
        setSearchQuery,
        clearSearch,
        refreshData,
        createSubject,
        updateSubject,
        deleteSubject,
        uploadNote,
        renameNote,
        deleteNote,
        downloadNote,
      }}
    >
      {children}
    </NoteNestContext.Provider>
  );
};

export function useNoteNest(): NoteNestContextValue {
  const ctx = useContext(NoteNestContext);
  if (!ctx) {
    throw new Error('useNoteNest must be used within a NoteNestProvider');
  }
  return ctx;
}
