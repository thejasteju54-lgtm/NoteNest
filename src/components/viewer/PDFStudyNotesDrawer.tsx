import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Copy,
  Download,
  Check,
  X,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { userPreferences } from '@/services/userPreferences';

interface PDFStudyNotesDrawerProps {
  noteId: string;
  noteTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PDFStudyNotesDrawer: React.FC<PDFStudyNotesDrawerProps> = ({
  noteId,
  noteTitle,
  isOpen,
  onClose,
}) => {
  const [content, setContent] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  useEffect(() => {
    if (!noteId) return;
    const existing = userPreferences.getStudyNotes(noteId);
    setContent(existing);
    if (existing) {
      setLastSavedTime('Saved');
    }
  }, [noteId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setContent(next);
    userPreferences.saveStudyNotes(noteId, next);
    setLastSavedTime('Saved');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob(
      [`# Study Notes: ${noteTitle}\n\n${content}\n\n---\n*Created with NoteNest*`],
      { type: 'text/markdown;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_study_notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInsertTemplate = () => {
    const template = `## Key Definitions\n- \n\n## Important Formulas & Theorems\n- \n\n## Exam Questions / Questions to Review\n- \n`;
    const next = content ? `${content}\n\n${template}` : template;
    setContent(next);
    userPreferences.saveStudyNotes(noteId, next);
    setLastSavedTime('Saved');
  };

  if (!isOpen) return null;

  return (
    <div className="w-full sm:w-80 lg:w-96 flex flex-col border-l border-slate-200 bg-white h-full z-20 shrink-0 shadow-lg sm:shadow-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent-sage" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-800">Study Scratchpad</h4>
        </div>
        <div className="flex items-center gap-1">
          {lastSavedTime && (
            <span className="text-[11px] text-emerald-600 font-medium mr-1.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> {lastSavedTime}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
            aria-label="Close Notes Drawer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-white text-xs gap-1 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInsertTemplate}
          className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
          title="Insert Study Template"
        >
          <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
          Template
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!content.trim()}
            className="h-7 px-2 text-[11px] text-slate-600"
            title="Copy notes to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!content.trim()}
            className="h-7 px-2 text-[11px] text-slate-600"
            title="Download notes as Markdown"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Textarea Body */}
      <div className="flex-1 p-3 flex flex-col">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Write your study notes, formulas, or lecture takeaways here while reading... (Auto-saved)"
          className="flex-1 w-full p-2.5 text-xs sm:text-sm font-mono leading-relaxed bg-slate-50/60 border border-slate-200/80 rounded-xl resize-none focus:outline-none focus:border-accent-sage focus:bg-white text-slate-800 transition-colors"
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>{content.length} characters</span>
        {content.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Clear all study notes for this document?')) {
                setContent('');
                userPreferences.saveStudyNotes(noteId, '');
              }
            }}
            className="text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
};
