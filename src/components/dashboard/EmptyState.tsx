import React from 'react';
import { useNoteNest } from '@/context/NoteNestContext';
import { Button } from '@/components/common/Button';
import { FolderPlus, Upload, FileQuestion } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionType?: 'create-subject' | 'upload-note' | 'both';
  subjectId?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No notes yet',
  description = 'No notes have been added to this subject. Drop a PDF to get started.',
  actionType = 'upload-note',
  subjectId,
}) => {
  const { openUploadModal, openSubjectModal } = useNoteNest();

  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200/90 bg-white/60 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-accent-sage/10 text-accent-sage flex items-center justify-center mb-4">
        <FileQuestion className="w-7 h-7" />
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-3">
        {(actionType === 'create-subject' || actionType === 'both') && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openSubjectModal()}
            leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
          >
            Create Subject
          </Button>
        )}
        {(actionType === 'upload-note' || actionType === 'both') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => openUploadModal(subjectId)}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Upload PDF
          </Button>
        )}
      </div>
    </div>
  );
};
