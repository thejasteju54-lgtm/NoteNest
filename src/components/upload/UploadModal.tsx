import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { DropZone } from './DropZone';
import { useNoteNest } from '@/context/NoteNestContext';
import { fileValidationService } from '@/services/fileValidationService';
import { sanitizeTitle } from '@/utils/formatters';
import { Folder, CheckCircle2, Plus } from 'lucide-react';

export const UploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    closeUploadModal,
    uploadTargetSubjectId,
    subjects,
    uploadNote,
    openSubjectModal,
  } = useNoteNest();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [validationError, setValidationError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize selected subject when modal opens
  useEffect(() => {
    if (isUploadModalOpen) {
      if (uploadTargetSubjectId) {
        setSelectedSubjectId(uploadTargetSubjectId);
      } else if (subjects.length > 0) {
        setSelectedSubjectId(subjects[0].id);
      } else {
        setSelectedSubjectId('');
      }
      setSelectedFile(null);
      setTitle('');
      setValidationError('');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isUploadModalOpen, uploadTargetSubjectId, subjects]);

  const handleFileSelect = async (file: File) => {
    setValidationError('');
    
    // Validate file
    const result = await fileValidationService.validatePdfFile(file);
    if (!result.isValid) {
      setSelectedFile(null);
      setValidationError(result.error || 'Invalid PDF file.');
      return;
    }

    setSelectedFile(file);
    // Auto-fill title if empty
    if (!title) {
      const cleanName = file.name.replace(/\.pdf$/i, '').trim();
      setTitle(cleanName || 'Untitled Note');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setValidationError('Please select a PDF file to upload.');
      return;
    }

    if (!selectedSubjectId) {
      setValidationError('Please select or create a destination subject.');
      return;
    }

    const cleanTitle = sanitizeTitle(title) || selectedFile.name.replace(/\.pdf$/i, '');

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Simulate smooth upload progress
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 25 : prev));
      }, 80);

      await uploadNote(selectedSubjectId, cleanTitle, selectedFile);

      clearInterval(progressTimer);
      setUploadProgress(100);

      setTimeout(() => {
        closeUploadModal();
      }, 350);
    } catch (err: any) {
      setValidationError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isUploadModalOpen}
      onClose={closeUploadModal}
      title="Upload Academic Note"
      description="Store a PDF note directly into your organized subject folder."
      maxWidth="md"
    >
      <form onSubmit={handleUpload} className="space-y-4">
        {/* Drop zone */}
        <DropZone
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          error={validationError}
        />

        {/* Note Title */}
        <Input
          label="Note Title"
          placeholder="e.g. Unit 1 Calculus Notes, Circuit Theory Formulas"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
          required
        />

        {/* Destination Subject Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 tracking-wide">
              Destination Subject
            </label>
            <button
              type="button"
              onClick={() => {
                closeUploadModal();
                openSubjectModal();
              }}
              className="text-[11px] font-semibold text-accent-sage hover:text-accent-sage-hover flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>New Subject</span>
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
              <span>No subjects exist yet. Create a subject folder first.</span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  closeUploadModal();
                  openSubjectModal();
                }}
              >
                Create Subject
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {subjects.map((subj) => {
                const isSelected = selectedSubjectId === subj.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-accent-sage bg-accent-sage/10 text-slate-900 ring-1 ring-accent-sage'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-accent-sage' : 'text-slate-400'}`} />
                      <span className="text-xs font-medium truncate">{subj.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-accent-sage shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Uploading to cloud storage...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-accent-sage h-full transition-all duration-150 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeUploadModal}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={!selectedFile || !selectedSubjectId || isUploading}
            isLoading={isUploading}
          >
            Save Note
          </Button>
        </div>
      </form>
    </Modal>
  );
};
