import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNoteNest } from '@/context/NoteNestContext';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button } from '@/components/common/Button';
import { backupService } from '@/services/backupService';
import { useToast } from '@/context/ToastContext';
import {
  Settings,
  Download,
  Upload,
  HardDrive,
  User,
  ShieldCheck,
  CheckCircle2,
  Cloud,
} from 'lucide-react';
import { formatFileSize } from '@/utils/formatters';

export const SettingsView: React.FC = () => {
  const { user, isSupabase, demoAccounts, switchDemoAccount } = useAuth();
  const { subjects, refreshData } = useNoteNest();
  const { success, error: showError } = useToast();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalNotes = subjects.reduce((sum, s) => sum + s.noteCount, 0);
  const totalSizeBytes = subjects.reduce((sum, s) => sum + s.totalSizeBytes, 0);

  const handleExportBackup = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      await backupService.exportBackup(user.id, user.name, user.email);
      success('Backup exported', 'Your NoteNest backup JSON archive has been downloaded.');
    } catch (err: any) {
      showError('Export failed', err.message || 'Could not export backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsImporting(true);
    try {
      const result = await backupService.importBackup(user.id, file);
      success(
        'Backup restored',
        `Successfully restored ${result.subjectsCount} subjects and ${result.notesCount} notes.`
      );
      await refreshData();
    } catch (err: any) {
      showError('Import failed', err.message || 'Failed to parse and restore backup archive.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto mb-16">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Settings & Data Storage', isActive: true },
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-accent-sage/15 text-accent-sage-hover flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings & Storage</h1>
            <p className="text-xs text-slate-500">
              {isSupabase
                ? 'Manage your cloud profile, database metrics, and backup archives.'
                : 'Manage your local demo profile, storage stats, and data backup archives.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: User Profile & Demo Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-slate-600" />
          <h2 className="text-base font-bold text-slate-900">Active Profile</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-sage text-white flex items-center justify-center font-bold text-sm">
              {user?.avatarInitials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 self-start sm:self-auto ${
              isSupabase
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isSupabase ? (
              <>
                <Cloud className="w-3.5 h-3.5" /> Supabase Authenticated
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5" /> Local Demo Profile
              </>
            )}
          </span>
        </div>

        {!isSupabase && (
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Switch Demo Student
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((account) => {
                const isActive = user?.id === account.id;
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => switchDemoAccount(account.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'border-accent-sage bg-accent-sage/10 ring-1 ring-accent-sage text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{account.name}</p>
                      <p className="text-[11px] text-slate-500">{account.role}</p>
                    </div>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-accent-sage shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Storage Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <HardDrive className="w-4 h-4 text-slate-600" />
          <h2 className="text-base font-bold text-slate-900">
            {isSupabase ? 'Cloud Database & Storage Metrics' : 'Local Browser Storage'}
          </h2>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {isSupabase
            ? 'All notes are stored in private Supabase Storage buckets with Row-Level Security (RLS) policies scoped strictly to your account.'
            : "PDFs and metadata persist locally in your browser's IndexedDB across sessions and reloads unless storage is cleared."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Subjects
            </span>
            <p className="text-xl font-bold text-slate-900 mt-1">{subjects.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total PDF Notes
            </span>
            <p className="text-xl font-bold text-slate-900 mt-1">{totalNotes}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isSupabase ? 'Cloud Storage' : 'IndexedDB Storage'}
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatFileSize(totalSizeBytes)}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Data Backup & Portability */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <h2 className="text-base font-bold text-slate-900">Backup & Portability</h2>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Export your entire note collection to a portable JSON backup file. You can restore this file on any device or browser anytime.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportBackup}
            isLoading={isExporting}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Backup Archive
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackup}
            className="hidden"
          />

          <Button
            variant="outline"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isImporting}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Restore from Backup
          </Button>
        </div>
      </div>
    </div>
  );
};
