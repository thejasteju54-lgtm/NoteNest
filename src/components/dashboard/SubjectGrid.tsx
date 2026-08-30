import React from 'react';
import { useNoteNest } from '@/context/NoteNestContext';
import { SubjectCard } from './SubjectCard';
import { Plus } from 'lucide-react';

export const SubjectGrid: React.FC = () => {
  const { subjects, openSubjectModal } = useNoteNest();

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Your Subjects</h2>
          <p className="text-xs text-slate-500">Folders for your academic classes and modules</p>
        </div>
        <button
          type="button"
          onClick={() => openSubjectModal()}
          className="text-xs font-semibold text-accent-sage hover:text-accent-sage-hover flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}

        {/* Add New Subject Card */}
        <button
          type="button"
          onClick={() => openSubjectModal()}
          className="group text-left rounded-2xl border-2 border-dashed border-slate-200 hover:border-accent-sage/60 hover:bg-slate-50/50 p-5 transition-card flex flex-col items-center justify-center gap-2.5 h-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-accent-sage/15 text-slate-400 group-hover:text-accent-sage flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
            Create New Subject
          </span>
        </button>
      </div>
    </section>
  );
};
