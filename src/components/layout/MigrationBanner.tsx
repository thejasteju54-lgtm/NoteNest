import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNoteNest } from '@/context/NoteNestContext';
import { useToast } from '@/context/ToastContext';
import { migrationService } from '@/services/migrationService';
import { Button } from '@/components/common/Button';
import { CloudUpload, X, CheckCircle2 } from 'lucide-react';

export const MigrationBanner: React.FC = () => {
  const { user, isSupabase } = useAuth();
  const { refreshData } = useNoteNest();
  const { success, error: showError } = useToast();

  const [localCounts, setLocalCounts] = useState<{ subjectsCount: number; notesCount: number } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isSupabase || !user) {
      setLocalCounts(null);
      return;
    }

    // Check if dismissed previously in session
    const dismissed = sessionStorage.getItem('notenest_migration_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    migrationService.getLocalDataSummary().then((counts) => {
      if (counts.notesCount > 0 || counts.subjectsCount > 0) {
        setLocalCounts(counts);
      }
    });
  }, [isSupabase, user]);

  if (!isSupabase || !user || isDismissed || !localCounts) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('notenest_migration_dismissed', 'true');
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const result = await migrationService.migrateToSupabase(user.id);
      success(
        'Notes Imported to Cloud',
        `Successfully uploaded ${result.subjectsMigrated} subjects and ${result.notesMigrated} notes to your NoteNest account.`
      );
      setLocalCounts(null);
      await refreshData();
    } catch (err: any) {
      showError('Migration failed', err.message || 'Could not import local notes.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-accent-sage/15 via-accent-blue/10 to-transparent border border-accent-sage/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-sage text-white flex items-center justify-center shrink-0">
          <CloudUpload className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Import Local Notes to your NoteNest Account?
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            We found {localCounts.subjectsCount} subjects and {localCounts.notesCount} PDF notes saved locally on this browser.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
        <Button variant="ghost" size="sm" onClick={handleDismiss} disabled={isMigrating}>
          Keep Local
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleMigrate}
          isLoading={isMigrating}
          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
        >
          Import to Cloud
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
