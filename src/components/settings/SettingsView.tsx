import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNoteNest } from '@/context/NoteNestContext';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button } from '@/components/common/Button';
import { backupService } from '@/services/backupService';
import { useToast } from '@/context/ToastContext';
import { activeStorageRepo } from '@/repositories/storage';
import {
  Settings,
  Download,
  Upload,
  HardDrive,
  User,
  ShieldCheck,
  LogOut,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { formatFileSize } from '@/utils/formatters';

export const SettingsView: React.FC = () => {
  const { user, signOut } = useAuth();
  const { subjects, refreshData } = useNoteNest();
  const { success, error: showError } = useToast();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalNotes = subjects.reduce((sum, s) => sum + s.noteCount, 0);
  const totalSizeBytes = subjects.reduce((sum, s) => sum + s.totalSizeBytes, 0);
  const quotaBytes = activeStorageRepo.getQuotaBytes();
  const providerName = activeStorageRepo.getProviderName();
  const percentUsed = Math.min(100, Math.round((totalSizeBytes / quotaBytes) * 100));

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
          { label: 'Settings & Storage', isActive: true },
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
              Manage your Supabase account, high-capacity cloud storage, and data archives.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: User Profile */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-slate-600" />
          <h2 className="text-base font-bold text-slate-900">Account Profile</h2>
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
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Supabase Authenticated
            </span>
            <Button variant="outline" size="sm" onClick={signOut} leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Section 2: Storage Statistics & High-Capacity Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">
              Private Cloud Storage & Capacity
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Cloud className="w-3 h-3 text-accent-sage" />
            {providerName}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Your notes and PDFs are securely stored in a private object storage bucket with Row-Level Security (RLS) policies scoped strictly to your account (<code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">{user?.id}</code>).
        </p>

        {/* Quota Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Storage Usage ({percentUsed}%)</span>
            <span className="font-mono text-slate-500">
              {formatFileSize(totalSizeBytes)} / {formatFileSize(quotaBytes)}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentUsed > 90
                  ? 'bg-rose-500'
                  : percentUsed > 75
                  ? 'bg-amber-500'
                  : 'bg-accent-sage'
              }`}
              style={{ width: `${Math.max(2, percentUsed)}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>High-capacity architecture: Zero egress fees with scalable multi-GB support.</span>
          </div>
        </div>

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
              Cloud Storage Used
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
