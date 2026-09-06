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
    <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 text-white shadow-md border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-sage/20 border border-accent-sage/30 flex items-center justify-center text-accent-sage">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white">
              Academic Study Hub
            </h4>
            <p className="text-[11px] text-slate-400">
              Active learning streaks & revision health
            </p>
          </div>
        </div>

        {/* Quick Spotlight Shortcut */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('notenest:open-command-palette'))}
          className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-[11px] text-slate-300 transition-colors"
          title="Press Ctrl+K or Cmd+K anytime"
        >
          <span>Spotlight Actions</span>
          <kbd className="font-mono text-[10px] bg-slate-900 px-1 py-0.5 rounded text-slate-400 border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* 3 Metric Pillars */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-3.5">
        {/* Metric 1: Streak */}
        <div className="bg-slate-800/60 rounded-xl p-2.5 sm:p-3 border border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-medium">Study Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-xl font-black text-amber-400">
              {stats.streakDays}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">
              {stats.streakDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 hidden xs:block">
            {stats.streakDays > 1 ? 'Keep momentum!' : 'Active today'}
          </span>
        </div>

        {/* Metric 2: Material & Pages */}
        <div className="bg-slate-800/60 rounded-xl p-2.5 sm:p-3 border border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-medium">Reading Activity</span>
            <BookOpen className="w-3.5 h-3.5 text-accent-sage" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-xl font-black text-white">
              {stats.totalPagesRead}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">pages</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 hidden xs:block">
            across {totalNotesCount} notes
          </span>
        </div>

        {/* Metric 3: Flashcards Mastered */}
        <div className="bg-slate-800/60 rounded-xl p-2.5 sm:p-3 border border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-medium">Active Recall</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-xl font-black text-indigo-400">
              {stats.cardsMastered}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">mastered</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 hidden xs:block">
            Flashcards learned
          </span>
        </div>
      </div>
    </div>
  );
};
