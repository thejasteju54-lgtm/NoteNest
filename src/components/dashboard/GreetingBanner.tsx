import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNoteNest } from '@/context/NoteNestContext';
import { getTimeOfDayGreeting } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { Upload, FolderPlus, FileText } from 'lucide-react';

export const GreetingBanner: React.FC = () => {
  const { user } = useAuth();
  const { subjects, openUploadModal, openSubjectModal } = useNoteNest();

  const totalNotes = subjects.reduce((sum, s) => sum + s.noteCount, 0);
  const greeting = getTimeOfDayGreeting(user?.name?.split(' ')[0]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-card mb-8">
      {/* Subtle decorative background gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-sage/10 via-accent-blue/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {greeting}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Everything you need for your studies, organized in one place. No more scrolling through WhatsApp groups.
          </p>

          {/* Quick stats chips */}
          <div className="flex items-center gap-4 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-accent-sage" />
              <span>{subjects.length} Subjects</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{totalNotes} PDF Notes</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => openSubjectModal()}
            leftIcon={<FolderPlus className="w-4 h-4 text-slate-600" />}
          >
            New Subject
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => openUploadModal()}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
