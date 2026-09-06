import React, { useState, useEffect } from 'react';
import { Flame, BookOpen, Layers, Sparkles } from 'lucide-react';
import { userPreferences, StudyStats } from '@/services/userPreferences';
import { useNoteNest } from '@/context/NoteNestContext';

export const StudyStatsWidget: React.FC = () => {
  const { subjects, recentNotes } = useNoteNest();
  const [stats, setStats] = useState<StudyStats>(() => userPreferences.getStudyStats());

  useEffect(() => {
    // Refresh stats when component mounts or notes change
    setStats(userPreferences.getStudyStats());
  }, [recentNotes]);

  // Compute total notes across subjects
  const totalNotesCount = subjects.reduce((acc, s) => acc + s.noteCount, 0);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 mb-6 sm:mb-8">
      {/* Harmonious ambient glassmorphic background gradient matching NoteNest canvas */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-accent-sage/15 via-accent-blue/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-500/10 via-accent-terracotta/5 to-transparent rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent-sage/15 border border-accent-sage/30 flex items-center justify-center text-accent-sage shrink-0 shadow-subtle">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
              Academic Study Hub
            </h3>
            <p className="text-xs text-slate-500">
              Active learning streaks & revision health
            </p>
          </div>
        </div>

        {/* Spotlight Command Palette Trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('notenest:open-command-palette'))}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 hover:border-slate-300 text-xs text-slate-700 font-medium transition-all shadow-subtle hover:shadow-card group cursor-pointer"
          title="Open Spotlight Command Palette (Ctrl+K)"
        >
          <span className="text-slate-600 group-hover:text-slate-900">Spotlight Actions</span>
          <kbd className="font-mono text-[10px] bg-slate-100 group-hover:bg-slate-50 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* 3 Frosted Metric Pillars */}
      <div className="relative z-10 grid grid-cols-3 gap-2.5 sm:gap-4 pt-4">
        {/* Metric 1: Study Streak */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-white/90 border border-amber-500/20 p-3 sm:p-4 shadow-subtle flex flex-col justify-between hover:border-amber-500/40 hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Study Streak</span>
            <div className="w-6 h-6 rounded-lg bg-amber-100/90 flex items-center justify-center text-amber-600">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
              {stats.streakDays}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {stats.streakDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 hidden xs:block">
            {stats.streakDays > 1 ? 'Keep the momentum!' : 'Active today'}
          </p>
        </div>

        {/* Metric 2: Reading Activity */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-accent-sage/15 via-emerald-50/40 to-white/90 border border-accent-sage/25 p-3 sm:p-4 shadow-subtle flex flex-col justify-between hover:border-accent-sage/50 hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Reading Activity</span>
            <div className="w-6 h-6 rounded-lg bg-accent-sage/20 flex items-center justify-center text-accent-sage">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalPagesRead}
            </span>
            <span className="text-xs font-medium text-slate-500">pages</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 hidden xs:block truncate">
            across {totalNotesCount} {totalNotesCount === 1 ? 'note' : 'notes'}
          </p>
        </div>

        {/* Metric 3: Active Recall Flashcards */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-accent-blue/15 via-indigo-50/40 to-white/90 border border-accent-blue/25 p-3 sm:p-4 shadow-subtle flex flex-col justify-between hover:border-accent-blue/50 hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Active Recall</span>
            <div className="w-6 h-6 rounded-lg bg-accent-blue/20 flex items-center justify-center text-accent-blue">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight">
              {stats.cardsMastered}
            </span>
            <span className="text-xs font-medium text-slate-500">mastered</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 hidden xs:block">
            Flashcards learned
          </p>
        </div>
      </div>
    </div>
  );
};
