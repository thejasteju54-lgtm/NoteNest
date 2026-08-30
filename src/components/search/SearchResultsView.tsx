import React from 'react';
import { useNoteNest } from '@/context/NoteNestContext';
import { Search, Folder, FileText, ArrowRight, X } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { formatFileSize, formatUploadDate } from '@/utils/formatters';

export const SearchResultsView: React.FC = () => {
  const { searchResults, searchQuery, clearSearch, navigateTo, openPreview } = useNoteNest();

  if (!searchResults) return null;

  return (
    <div className="space-y-6 mb-12">
      {/* Search Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-sage/15 text-accent-sage-hover flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Search results for "{searchQuery}"
            </h2>
            <p className="text-xs text-slate-500">
              Found {searchResults.totalMatches} {searchResults.totalMatches === 1 ? 'match' : 'matches'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clearSearch}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Search</span>
        </button>
      </div>

      {searchResults.totalMatches === 0 ? (
        <div className="text-center py-12 bg-white/70 rounded-2xl border border-dashed border-slate-200 p-8">
          <p className="text-sm font-semibold text-slate-800">No matching subjects or notes</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn't find any documents or folders matching "{searchQuery}". Check for typos or try searching with a shorter keyword.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Matching Subjects */}
          {searchResults.matchingSubjects.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Matching Subjects ({searchResults.matchingSubjects.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.matchingSubjects.map((subj) => (
                  <div
                    key={subj.id}
                    onClick={() => {
                      clearSearch();
                      navigateTo({ type: 'subject', subjectId: subj.id });
                    }}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-accent-sage hover:shadow-subtle cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Folder className="w-5 h-5 text-accent-sage shrink-0" />
                      <div className="truncate">
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-accent-sage-hover truncate">
                          {subj.name}
                        </h4>
                        <p className="text-xs text-slate-500">{subj.noteCount} notes</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-accent-sage transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Notes */}
          {searchResults.matchingNotes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Matching PDF Notes ({searchResults.matchingNotes.length})
              </h3>
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card divide-y divide-slate-100 overflow-hidden">
                {searchResults.matchingNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => openPreview(note.id)}
                    className="flex items-center justify-between p-4 hover:bg-canvas-subtle/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-accent-sage-hover transition-colors truncate">
                          {note.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <Badge
                            colorId={note.subjectColorId}
                            label={note.subjectName}
                            size="sm"
                          />
                          <span>•</span>
                          <span>{formatUploadDate(note.createdAt)}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {formatFileSize(note.fileSize)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-accent-sage shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
