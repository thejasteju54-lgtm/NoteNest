import React, { useState } from 'react';
import { SubjectWithNoteCount } from '@/types/subject';
import { useNoteNest } from '@/context/NoteNestContext';
import { SUBJECT_COLORS, ColorOption } from '@/config/constants';
import { Folder, MoreVertical, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { Dropdown, DropdownItem } from '@/components/common/Dropdown';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { clsx } from 'clsx';
import { formatFileSize } from '@/utils/formatters';

export interface SubjectCardProps {
  subject: SubjectWithNoteCount;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const { navigateTo, openSubjectModal, deleteSubject } = useNoteNest();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const colorDef =
    SUBJECT_COLORS.find((c) => c.id === subject.colorId) || (SUBJECT_COLORS[0] as ColorOption);

  const menuItems: DropdownItem[] = [
    {
      id: 'edit',
      label: 'Rename Subject',
      icon: <Edit2 className="w-3.5 h-3.5" />,
      onClick: () => openSubjectModal(subject),
    },
    {
      id: 'delete',
      label: 'Delete Subject',
      variant: 'danger',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      onClick: () => setIsDeleteDialogOpen(true),
    },
  ];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSubject(subject.id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigateTo({ type: 'subject', subjectId: subject.id })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigateTo({ type: 'subject', subjectId: subject.id });
          }
        }}
        className={clsx(
          'group relative text-left rounded-2xl bg-white border border-slate-200/90 p-5 shadow-subtle hover:shadow-card-hover transition-card',
          'cursor-pointer flex flex-col justify-between h-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage',
          'hover:border-slate-300'
        )}
      >
        {/* Top bar with folder icon & options menu */}
        <div className="flex items-start justify-between">
          <div
            className={clsx(
              'w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200',
              colorDef.bgSubtle,
              colorDef.badgeText
            )}
          >
            <Folder className="w-5 h-5 fill-current" />
          </div>

          <div
            className="opacity-80 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown
              trigger={
                <button
                  type="button"
                  aria-label={`Options for ${subject.name}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
              items={menuItems}
            />
          </div>
        </div>

        {/* Center & Bottom details */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-accent-sage-hover transition-colors truncate">
              {subject.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-accent-sage transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 opacity-0 group-hover:opacity-100" />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5 pt-2 border-t border-slate-100">
            <span className="font-medium">
              {subject.noteCount} {subject.noteCount === 1 ? 'note' : 'notes'}
            </span>
            {subject.totalSizeBytes > 0 && (
              <span className="font-mono text-[11px] text-slate-400">
                {formatFileSize(subject.totalSizeBytes)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subject?"
        message={`Are you sure you want to delete "${subject.name}"? All ${subject.noteCount} notes inside will also be permanently deleted from local storage.`}
        confirmText="Delete Subject"
        isLoading={isDeleting}
      />
    </>
  );
};
