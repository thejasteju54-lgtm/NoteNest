import React, { useState } from 'react';
import { useNoteNest } from '@/context/NoteNestContext';
import { Note } from '@/types/note';
import { FileText, Download, Eye, MoreVertical, Edit2, Trash2, Star } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Dropdown, DropdownItem } from '@/components/common/Dropdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { NoteRenameModal } from '@/components/subjects/NoteRenameModal';
import { formatFileSize, formatUploadDate } from '@/utils/formatters';
import { userPreferences } from '@/services/userPreferences';

export const RecentNotes: React.FC = () => {
  const { recentNotes, openPreview, downloadNote, deleteNote } = useNoteNest();
  const [selectedNoteForRename, setSelectedNoteForRename] = useState<Note | null>(null);
  const [selectedNoteForDelete, setSelectedNoteForDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred'>('all');
  const [, setStarUpdateCounter] = useState(0);

  if (recentNotes.length === 0) {
    return null;
  }

  const starredIds = userPreferences.getStarredNoteIds();
  const displayedNotes =
    activeFilter === 'starred'
      ? recentNotes.filter((n) => starredIds.includes(n.id))
      : recentNotes;

  const handleDelete = async () => {
    if (!selectedNoteForDelete) return;
    setIsDeleting(true);
    try {
      await deleteNote(selectedNoteForDelete.id);
      setSelectedNoteForDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStar = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    userPreferences.toggleNoteStarred(noteId);
    setStarUpdateCounter((c) => c + 1);
  };

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Recently Added</h2>
          <p className="text-xs text-slate-500">Your latest uploaded lecture notes and materials</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Notes ({recentNotes.length})
          </button>
          <button
            onClick={() => setActiveFilter('starred')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
              activeFilter === 'starred'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            Starred ({starredIds.filter((id) => recentNotes.some((n) => n.id === id)).length})
          </button>
        </div>
      </div>

      {displayedNotes.length === 0 && activeFilter === 'starred' ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 shadow-card">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mx-auto mb-2.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">No Starred Notes Yet</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Tap the star icon next to any note to bookmark your cheat sheets and exam prep materials here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card divide-y divide-slate-100 overflow-hidden">
          {displayedNotes.map((note) => {
            const isStarred = starredIds.includes(note.id);

            const menuItems: DropdownItem[] = [
              {
                id: 'view',
                label: 'View PDF',
                icon: <Eye className="w-3.5 h-3.5" />,
                onClick: () => openPreview(note.id),
              },
              {
                id: 'star',
                label: isStarred ? 'Unstar Note' : 'Star Note',
                icon: (
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isStarred ? 'fill-amber-400 text-amber-500' : ''
                    }`}
                  />
                ),
                onClick: () => {
                  userPreferences.toggleNoteStarred(note.id);
                  setStarUpdateCounter((c) => c + 1);
                },
              },
              {
                id: 'download',
                label: 'Download PDF',
                icon: <Download className="w-3.5 h-3.5" />,
                onClick: () => downloadNote(note.id),
              },
              {
                id: 'rename',
                label: 'Rename Note',
                icon: <Edit2 className="w-3.5 h-3.5" />,
                onClick: () => setSelectedNoteForRename(note),
              },
              {
                id: 'delete',
                label: 'Delete Note',
                variant: 'danger',
                icon: <Trash2 className="w-3.5 h-3.5" />,
                onClick: () => setSelectedNoteForDelete(note),
              },
            ];

            return (
              <div
                key={note.id}
                onClick={() => openPreview(note.id)}
                className="flex items-center justify-between p-4 hover:bg-canvas-subtle/50 transition-colors cursor-pointer group select-none"
              >
                {/* Left info */}
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-accent-sage-hover transition-colors truncate">
                        {note.title}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(e, note.id)}
                        className="p-0.5 rounded text-slate-300 hover:text-amber-500 transition-colors"
                        title={isStarred ? 'Unstar note' : 'Star note'}
                        aria-label="Star note"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isStarred
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        colorId={note.subjectColorId || 'sage'}
                        label={note.subjectName || 'Subject'}
                        size="sm"
                      />
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500">
                        {formatUploadDate(note.createdAt)}
                      </span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatFileSize(note.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => downloadNote(note.id)}
                    aria-label={`Download ${note.title}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden sm:inline-flex"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <Dropdown
                    trigger={
                      <button
                        type="button"
                        aria-label="Note options"
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                    items={menuItems}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rename modal */}
      {selectedNoteForRename && (
        <NoteRenameModal
          note={selectedNoteForRename}
          isOpen={true}
          onClose={() => setSelectedNoteForRename(null)}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedNoteForDelete)}
        onClose={() => setSelectedNoteForDelete(null)}
        onConfirm={handleDelete}
        title="Delete PDF Note?"
        message={`Are you sure you want to delete "${selectedNoteForDelete?.title}"? This cannot be undone.`}
        confirmText="Delete Note"
        isLoading={isDeleting}
      />
    </section>
  );
};
