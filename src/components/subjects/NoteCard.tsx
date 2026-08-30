import React, { useState } from 'react';
import { Note } from '@/types/note';
import { useNoteNest } from '@/context/NoteNestContext';
import { FileText, Download, Eye, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Dropdown, DropdownItem } from '@/components/common/Dropdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { NoteRenameModal } from './NoteRenameModal';
import { formatFileSize, formatUploadDate } from '@/utils/formatters';

export interface NoteCardProps {
  note: Note;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const { openPreview, downloadNote, deleteNote } = useNoteNest();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuItems: DropdownItem[] = [
    {
      id: 'view',
      label: 'View PDF',
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: () => openPreview(note.id),
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
      onClick: () => setIsRenameOpen(true),
    },
    {
      id: 'delete',
      label: 'Delete Note',
      variant: 'danger',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      onClick: () => setIsDeleteOpen(true),
    },
  ];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNote(note.id);
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => openPreview(note.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openPreview(note.id);
          }
        }}
        className="group relative rounded-2xl bg-white border border-slate-200/90 p-4 shadow-subtle hover:shadow-card-hover transition-card text-left cursor-pointer flex flex-col justify-between h-44 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
      >
        {/* Top: Icon & More menu */}
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-500 transition-transform group-hover:scale-105">
            <FileText className="w-5 h-5" />
          </div>

          <div
            className="opacity-70 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown
              trigger={
                <button
                  type="button"
                  aria-label="Note options"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
              items={menuItems}
            />
          </div>
        </div>

        {/* Middle: Title */}
        <div className="my-auto py-1">
          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-accent-sage-hover transition-colors line-clamp-2 leading-snug">
            {note.title}
          </h4>
        </div>

        {/* Bottom: Date & Size */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>{formatUploadDate(note.createdAt)}</span>
          <span className="font-mono text-[11px] text-slate-400">
            {formatFileSize(note.fileSize)}
          </span>
        </div>
      </div>

      {/* Rename modal */}
      {isRenameOpen && (
        <NoteRenameModal
          note={note}
          isOpen={isRenameOpen}
          onClose={() => setIsRenameOpen(false)}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete PDF Note?"
        message={`Are you sure you want to delete "${note.title}"?`}
        confirmText="Delete Note"
        isLoading={isDeleting}
      />
    </>
  );
};
