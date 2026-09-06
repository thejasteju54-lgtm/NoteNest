import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { PDFCanvasViewer } from './PDFCanvasViewer';
import { PDFStudyNotesDrawer } from './PDFStudyNotesDrawer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { userPreferences } from '@/services/userPreferences';
import { playPomodoroChime } from '@/utils/sound';

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
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState<boolean>(false);
  const [jumpToPage, setJumpToPage] = useState<number | undefined>(undefined);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Pomodoro Focus Timer State
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isPomodoroActive, setIsPomodoroActive] = useState<boolean>(false);
  const [isPomodoroBreak, setIsPomodoroBreak] = useState<boolean>(false);

  const reuploadInputRef = useRef<HTMLInputElement>(null);

  // Fullscreen API toggle
  const handleToggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => {
      const next = !prev;
      if (next) {
        try {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {
          // Fallback to in-app fullscreen CSS
        }
      } else {
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // Ignore
        }
      }
      return next;
    });
  }, []);

  // Sync with browser native fullscreen exit (e.g. user pressed Esc)
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [isFullScreen]);

  // Pomodoro timer tick
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPomodoroActive) {
      timer = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            playPomodoroChime();
            setIsPomodoroBreak((b) => !b);
            return !isPomodoroBreak ? 5 * 60 : 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPomodoroActive, isPomodoroBreak]);

  useEffect(() => {
    if (!previewNoteId || !user) {
      setNote(null);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      setArrayBuffer(null);
      setIsStarred(false);
      setIsNotesDrawerOpen(false);
      setIsFullScreen(false);
      setIsZenMode(false);
      return;
    }

    setIsStarred(userPreferences.isNoteStarred(previewNoteId));

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadNoteBlob() {
      try {
        const foundNote = await noteService.getNoteById(user!.id, previewNoteId!);
        if (!foundNote) {
          throw new Error('Note could not be found.');
        }

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

  const handleToggleStar = () => {
    if (!note) return;
    const next = userPreferences.toggleNoteStarred(note.id);
    setIsStarred(next);
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
      maxWidth="full"
      fullScreen={isFullScreen}
      noPadding={true}
      showCloseButton={false}
    >
      <ErrorBoundary fallbackTitle="Could not display PDF preview">
        <div className="flex flex-col w-full h-full flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 w-full h-full bg-white gap-3 p-6">
              <Loader2 className="w-9 h-9 animate-spin text-accent-sage" />
              <p className="text-sm font-semibold text-slate-600 tracking-wide">
                Loading PDF document...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center flex-1 w-full h-full p-6 text-center bg-white">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-slate-800">
                Could not display PDF
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-5">
                {error.includes('binary data missing')
                  ? 'The PDF file binary for this note could not be retrieved from cloud storage. Re-upload the PDF to restore viewing.'
                  : error}
              </p>

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
              <div className="flex flex-row w-full h-full flex-1 overflow-hidden relative">
                {/* 100% PDF View with Unified Master Toolbar */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                  <PDFCanvasViewer
                    blobUrl={blobUrl}
                    arrayBuffer={arrayBuffer}
                    noteId={note?.id}
                    title={note?.title}
                    subjectName={subject?.name}
                    subjectColorId={subject?.colorId}
                    isStarred={isStarred}
                    onToggleStar={handleToggleStar}
                    isFullScreen={isFullScreen}
                    onToggleFullScreen={handleToggleFullScreen}
                    isZenMode={isZenMode}
                    onToggleZenMode={() => setIsZenMode((z) => !z)}
                    isNotesDrawerOpen={isNotesDrawerOpen}
                    onToggleNotesDrawer={() => setIsNotesDrawerOpen((o) => !o)}
                    onClose={closePreview}
                    onDownload={() => note && downloadNote(note.id)}
                    onPrint={handlePrint}
                    onOpenInTab={handleOpenInNewTab}
                    pomodoroSeconds={pomodoroSeconds}
                    isPomodoroActive={isPomodoroActive}
                    isPomodoroBreak={isPomodoroBreak}
                    onTogglePomodoro={() => setIsPomodoroActive((a) => !a)}
                    onResetPomodoro={() => {
                      setIsPomodoroActive(false);
                      setIsPomodoroBreak(false);
                      setPomodoroSeconds(25 * 60);
                    }}
                    onFallback={() => setViewMode('native')}
                    externalPage={jumpToPage}
                  />
                </div>

                {/* Collapsible Study Notes Drawer */}
                {note && (
                  <PDFStudyNotesDrawer
                    noteId={note.id}
                    noteTitle={note.title}
                    isOpen={isNotesDrawerOpen}
                    onClose={() => setIsNotesDrawerOpen(false)}
                    onJumpToPage={(p) => setJumpToPage(p)}
                  />
                )}
              </div>
            ) : (
              /* Fallback Native PDF View with Matching Compact 44px Top Bar */
              <div className="flex flex-col w-full h-full flex-1 overflow-hidden">
                <div className="h-11 sm:h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 flex items-center justify-between gap-2 shrink-0 z-20">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={closePreview}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Close Preview (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {note?.title || 'PDF Document'}
                    </h3>
                    {subject && (
                      <Badge colorId={subject.colorId} label={subject.name} size="sm" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setViewMode('canvas')}
                      className="h-7 px-2.5 text-xs font-semibold"
                    >
                      Switch to Canvas View
                    </Button>
                    <button
                      onClick={handleToggleFullScreen}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title={isFullScreen ? 'Exit Full Size (F)' : 'Full Size (F)'}
                    >
                      {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isFullScreen ? 'Exit' : 'Full Size'}</span>
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="h-7 w-7 p-0"
                      title="Print"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenInNewTab}
                      className="h-7 w-7 p-0"
                      title="Open in Tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => note && downloadNote(note.id)}
                      className="h-7 w-7 p-0"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <iframe
                  id="pdf-viewer-frame"
                  src={`${blobUrl}#toolbar=1&navpanes=1`}
                  title={note?.title || 'PDF Preview'}
                  className="w-full flex-1 border-none bg-white"
                />
              </div>
            )
          ) : null}
        </div>
      </ErrorBoundary>
    </Modal>
  );
};
