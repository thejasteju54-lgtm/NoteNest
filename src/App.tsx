import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNoteNest } from '@/context/NoteNestContext';
import { Navbar } from '@/components/layout/Navbar';
import { MigrationBanner } from '@/components/layout/MigrationBanner';
import { GreetingBanner } from '@/components/dashboard/GreetingBanner';
import { SubjectGrid } from '@/components/dashboard/SubjectGrid';
import { RecentNotes } from '@/components/dashboard/RecentNotes';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { SubjectDetailView } from '@/components/subjects/SubjectDetailView';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { UploadModal } from '@/components/upload/UploadModal';
import { SubjectModal } from '@/components/subjects/SubjectModal';
import { PDFViewerModal } from '@/components/viewer/PDFViewerModal';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const { isLoading: isAuthLoading, isSupabase } = useAuth();
  const {
    activePage,
    subjects,
    searchResults,
    searchQuery,
    isLoading: isDataLoading,
  } = useNoteNest();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-accent-sage/20 text-accent-sage flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Opening NoteNest...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-900 flex flex-col selection:bg-accent-sage/20">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Safe Migration Banner when local notes exist */}
        <MigrationBanner />

        {searchQuery.trim() && searchResults ? (
          /* Search Results View */
          <SearchResultsView />
        ) : activePage.type === 'dashboard' ? (
          /* Dashboard View */
          <div className="animate-in fade-in duration-150">
            <GreetingBanner />
            {subjects.length === 0 && !isDataLoading ? (
              <EmptyState
                title="Your study nest is empty"
                description="Create subject folders (e.g. Mathematics, Physics, Electrical Engineering) and upload your PDFs to stay organized."
                actionType="both"
              />
            ) : (
              <>
                <SubjectGrid />
                <RecentNotes />
              </>
            )}
          </div>
        ) : activePage.type === 'subject' ? (
          /* Subject Detail Page */
          <div className="animate-in fade-in duration-150">
            <SubjectDetailView subjectId={activePage.subjectId} />
          </div>
        ) : activePage.type === 'settings' ? (
          /* Settings View */
          <div className="animate-in fade-in duration-150">
            <SettingsView />
          </div>
        ) : null}
      </main>

      {/* Global Modals */}
      <UploadModal />
      <SubjectModal />
      <PDFViewerModal />

      {/* Minimal Footer */}
      <footer className="w-full border-t border-slate-200/80 py-6 mt-auto text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NoteNest — Your notes. Organized.</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabase ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            {isSupabase ? 'Connected to Supabase Cloud' : 'Local Demo Storage Mode'}
          </span>
        </div>
      </footer>
    </div>
  );
};
export default App;
