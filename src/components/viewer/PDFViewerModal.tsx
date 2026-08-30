import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNoteNest } from '@/context/NoteNestContext';
import { noteService } from '@/services/noteService';
import { Note } from '@/types/note';
import { Subject } from '@/types/subject';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Download,
  ExternalLink,
  Printer,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatFileSize, formatUploadDate } from '@/utils/formatters';

export const PDFViewerModal: React.FC = () => {
  const { user } = useAuth();
  const { previewNoteId, closePreview, subjects, downloadNote } = useNoteNest();

  const [note, setNote] = useState<Note | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewNoteId || !user) {
      setNote(null);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadNoteBlob() {
      try {
        const foundNote = await noteService.getNoteById(user!.id, previewNoteId!);
        if (!foundNote) {
          throw new Error('Note could not be found.');
        }

        const blob = await noteService.getNoteFileBlob(user!.id, previewNoteId!);
        if (!blob) {
          throw new Error('PDF file binary data missing from cloud storage.');
        }

        const url = URL.createObjectURL(blob);
        if (isMounted) {
          setNote(foundNote);
          setBlobUrl(url);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load PDF document.';
          setError(message);
          setIsLoading(false);
        }
      }
    }

    loadNoteBlob();

    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [previewNoteId, user]);

  const subject: Subject | undefined = subjects.find((s) => s.id === note?.subjectId);

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  const handlePrint = () => {
    if (blobUrl) {
      const iframe = document.getElementById('pdf-viewer-frame') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.print();
      } else {
        window.open(blobUrl, '_blank')?.print();
      }
    }
  };

  return (
    <Modal
      isOpen={Boolean(previewNoteId)}
      onClose={closePreview}
      maxWidth="4xl"
      showCloseButton={true}
    >
      <div className="flex flex-col h-[78vh] sm:h-[82vh]">
        {/* Document Meta Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2.5 sm:gap-3">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {note?.title || 'PDF Document'}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[11px] sm:text-xs text-slate-500 flex-wrap">
                {subject && (
                  <Badge colorId={subject.colorId} label={subject.name} size="sm" />
                )}
                {note && (
                  <>
                    <span className="hidden xs:inline">•</span>
                    <span className="hidden xs:inline">{formatUploadDate(note.createdAt)}</span>
                    <span>•</span>
                    <span className="font-mono">{formatFileSize(note.fileSize)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action toolbar */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex"
            >
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              <span className="hidden xs:inline">Open Tab</span>
              <span className="xs:hidden">Open</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => note && downloadNote(note.id)}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download
            </Button>
          </div>
        </div>

        {/* PDF Viewer Container */}
        <div className="flex-1 w-full bg-slate-900/5 rounded-xl overflow-hidden mt-3 relative border border-slate-200/80">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-accent-sage" />
              <p className="text-xs font-medium text-slate-500">Loading PDF document...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white">
              <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">Could not display PDF</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{error}</p>
              {note && (
                <Button variant="secondary" size="sm" onClick={() => downloadNote(note.id)}>
                  Download File Directly
                </Button>
              )}
            </div>
          ) : blobUrl ? (
            <iframe
              id="pdf-viewer-frame"
              src={`${blobUrl}#toolbar=1&navpanes=1`}
              title={note?.title || 'PDF Preview'}
              className="w-full h-full border-none rounded-xl bg-white"
            />
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
