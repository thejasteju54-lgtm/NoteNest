import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNoteNest } from '@/context/NoteNestContext';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { NoteCard } from './NoteCard';
import { NoteList } from './NoteList';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { NoteSortOption, Note } from '@/types/note';
import { noteService } from '@/services/noteService';
import {
  Upload,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Edit2,
  Trash2,
  Folder,
  X,
} from 'lucide-react';
import { Dropdown, DropdownItem } from '@/components/common/Dropdown';

export interface SubjectDetailViewProps {
  subjectId: string;
}

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({ subjectId }) => {
  const { user } = useAuth();
  const {
    subjects,
    openUploadModal,
    openSubjectModal,
    deleteSubject,
    navigateTo,
  } = useNoteNest();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<NoteSortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const subject = useMemo(() => {
    return subjects.find((s) => s.id === subjectId) || null;
  }, [subjects, subjectId]);

  // Fetch notes for this subject
  useEffect(() => {
    if (!user || !subjectId) return;

    let isMounted = true;
    setIsLoadingNotes(true);

    noteService
      .getNotes(user.id, subjectId, sortOption)
      .then((data) => {
        if (isMounted) {
          setNotes(data);
          setIsLoadingNotes(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load notes for subject:', err);
        if (isMounted) setIsLoadingNotes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, subjectId, sortOption, subjects]);

  // Filter notes by search within subject
  const filteredNotes = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return notes;
    return notes.filter((n) =>
      n.title.toLowerCase().includes(trimmed) || n.fileName.toLowerCase().includes(trimmed)
    );
  }, [notes, searchQuery]);

  if (!subject && !isLoadingNotes) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Subject Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          This subject may have been deleted or does not belong to your account.
        </p>
        <Button variant="primary" onClick={() => navigateTo({ type: 'dashboard' })}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleDeleteSubject = async () => {
    if (!subject) return;
    setIsDeleting(true);
    try {
      await deleteSubject(subject.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const sortLabels: Record<NoteSortOption, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    'name-asc': 'Name (A to Z)',
    'name-desc': 'Name (Z to A)',
    'size-desc': 'Largest Size',
  };

  const sortDropdownItems: DropdownItem[] = [
    { id: 'newest', label: 'Newest First', onClick: () => setSortOption('newest') },
    { id: 'oldest', label: 'Oldest First', onClick: () => setSortOption('oldest') },
    { id: 'name-asc', label: 'Name (A to Z)', onClick: () => setSortOption('name-asc') },
    { id: 'name-desc', label: 'Name (Z to A)', onClick: () => setSortOption('name-desc') },
    { id: 'size-desc', label: 'Largest Size', onClick: () => setSortOption('size-desc') },
  ];

  const subjectActionItems: DropdownItem[] = [
    {
      id: 'edit',
      label: 'Rename Subject',
      icon: <Edit2 className="w-3.5 h-3.5" />,
      onClick: () => subject && openSubjectModal(subject),
    },
    {
      id: 'delete',
      label: 'Delete Subject',
      variant: 'danger',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      onClick: () => setIsDeleteDialogOpen(true),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Subjects', onClick: () => navigateTo({ type: 'dashboard' }) },
          { label: subject?.name || 'Subject', isActive: true },
        ]}
      />

      {/* Subject Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-sage/15 text-accent-sage-hover flex items-center justify-center shrink-0">
              <Folder className="w-6 h-6 fill-current" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {subject?.name}
                </h1>
                <Badge
                  colorId={subject?.colorId || 'sage'}
                  label={`${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
                  size="sm"
                />
              </div>
              {subject?.description ? (
                <p className="text-sm text-slate-500">{subject.description}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  All PDF documents and study notes for this subject
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <Dropdown
              trigger={
                <Button variant="secondary" size="sm">
                  Options
                </Button>
              }
              items={subjectActionItems}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => openUploadModal(subjectId)}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload PDF
            </Button>
          </div>
        </div>

        {/* Toolbar: Search inside subject, Sort, View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100">
          {/* Search within subject */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes in this subject..."
              className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs rounded-xl border border-slate-200 pl-9 pr-8 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & Grid/List switches */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>{sortLabels[sortOption]}</span>
                </button>
              }
              items={sortDropdownItems}
            />

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Content */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching notes' : 'No notes in this subject yet'}
          description={
            searchQuery
              ? `No notes matched "${searchQuery}". Try a different keyword or clear search.`
              : 'Upload syllabus, unit notes, question banks, or assignment PDFs here.'
          }
          actionType={searchQuery ? 'create-subject' : 'upload-note'}
          subjectId={subjectId}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <NoteList notes={filteredNotes} />
      )}

      {/* Delete Subject Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject?"
        message={`Are you sure you want to delete "${subject?.name}"? All ${notes.length} notes inside will also be removed from local storage.`}
        confirmText="Delete Subject"
        isLoading={isDeleting}
      />
    </div>
  );
};
