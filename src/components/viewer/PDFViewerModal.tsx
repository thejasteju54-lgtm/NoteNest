import React, { useState, useEffect, useRef } from 'react';
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
  UploadCloud,
  Trash2,
} from 'lucide-react';
import { formatFileSize, formatUploadDate } from '@/utils/formatters';
import { PDFCanvasViewer } from './PDFCanvasViewer';

export const PDFViewerModal: React.FC = () => {
  const { user } = useAuth();
  const {
    previewNoteId,
    closePreview,
    subjects,
    downloadNote,
    reuploadNoteFile,
    deleteNote,
  } = useNoteNest();

  const [note, setNote] = useState<Note | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'native'>('canvas');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReuploading, setIsReuploading] = useState<boolean>(false);
  const reuploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!previewNoteId || !user) {
      setNote(null);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      setArrayBuffer(null);
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

        // Immediately set note metadata so header displays title & details even if file binary fails
        if (isMounted) {
          setNote(foundNote);
        }

        const blob = await noteService.getNoteFileBlob(user!.id, previewNoteId!);
        if (!blob) {
          throw new Error('PDF file binary data missing from cloud storage.');
        }

        const buf = await blob.arrayBuffer();
        const url = URL.createObjectURL(blob);
        if (isMounted) {
          setArrayBuffer(buf);
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

  const handleReupload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !note || !user) return;

    try {
      setIsReuploading(true);
      setError(null);
      const updated = await reuploadNoteFile(note.id, file);
      setNote(updated);

      const blob = await noteService.getNoteFileBlob(user.id, note.id);
      if (blob) {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        const buf = await blob.arrayBuffer();
        const newUrl = URL.createObjectURL(blob);
        setArrayBuffer(buf);
        setBlobUrl(newUrl);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Re-upload failed';
      setError(msg);
    } finally {
      setIsReuploading(false);
      if (reuploadInputRef.current) {
        reuploadInputRef.current.value = '';
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
            {blobUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode((m) => (m === 'canvas' ? 'native' : 'canvas'))}
                className="hidden sm:inline-flex"
                title="Switch between Canvas and Native PDF Engine"
              >
                {viewMode === 'canvas' ? 'Native View' : 'Canvas View'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!blobUrl}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex"
            >
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              disabled={!blobUrl}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              <span className="hidden xs:inline">Open Tab</span>
              <span className="xs:hidden">Open</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => note && downloadNote(note.id)}
              disabled={!blobUrl}
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
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-slate-800">Could not display PDF</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-5">
                {error.includes('binary data missing')
                  ? 'The PDF file binary for this note could not be retrieved from cloud storage. Re-upload the PDF to restore viewing.'
                  : error}
              </p>

              {/* Hidden file input for re-uploading PDF */}
              <input
                ref={reuploadInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleReupload}
              />

              <div className="flex items-center gap-2.5 flex-wrap justify-center">
                {note && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => reuploadInputRef.current?.click()}
                    isLoading={isReuploading}
                    leftIcon={<UploadCloud className="w-4 h-4" />}
                  >
                    Re-upload PDF File
                  </Button>
                )}
                {note && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
                        await deleteNote(note.id);
                        closePreview();
                      }
                    }}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete Note
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={closePreview}>
                  Close
                </Button>
              </div>
            </div>
          ) : blobUrl ? (
            viewMode === 'canvas' ? (
              <PDFCanvasViewer
                blobUrl={blobUrl}
                arrayBuffer={arrayBuffer}
                title={note?.title}
                onFallback={() => setViewMode('native')}
              />
            ) : (
              <iframe
                id="pdf-viewer-frame"
                src={`${blobUrl}#toolbar=1&navpanes=1`}
                title={note?.title || 'PDF Preview'}
                className="w-full h-full border-none rounded-xl bg-white"
              />
            )
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
