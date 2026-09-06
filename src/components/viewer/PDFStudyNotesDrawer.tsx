import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Copy,
  Download,
  Check,
  X,
  Sparkles,
  Layers,
  Edit3,
  Eye,
  Plus,
  Trash2,
  RotateCw,
  Award,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { userPreferences, Flashcard } from '@/services/userPreferences';

interface PDFStudyNotesDrawerProps {
  noteId: string;
  noteTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onJumpToPage?: (pageNum: number) => void;
}

export const PDFStudyNotesDrawer: React.FC<PDFStudyNotesDrawerProps> = ({
  noteId,
  noteTitle,
  isOpen,
  onClose,
  onJumpToPage,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards'>('notes');
  const [content, setContent] = useState<string>('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [extractNotice, setExtractNotice] = useState<string | null>(null);

  // Load existing notes & flashcards
  useEffect(() => {
    if (!noteId) return;
    const existingNotes = userPreferences.getStudyNotes(noteId);
    setContent(existingNotes);
    if (existingNotes) {
      setLastSavedTime('Saved');
    }

    const existingCards = userPreferences.getFlashcards(noteId);
    setFlashcards(existingCards);
    setIsQuizMode(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
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
    const template = `## 📌 Key Takeaways\n- [ ] Understand fundamental concepts\n- [ ] Review lecture slide definitions\n\n## 💡 Key Definitions\nQ: Key Concept A: Clear and concise definition here\nConcept :: Definition for quick active recall\n\n## 📐 Important Formulas & Equations\n- Formula: E = mc^2\n\n## ❓ Exam Questions to Review\n- [ ] Practice question 1\n- [ ] Practice question 2\n`;
    const next = content ? `${content}\n\n${template}` : template;
    setContent(next);
    userPreferences.saveStudyNotes(noteId, next);
    setLastSavedTime('Saved');
  };

  // Interactive Checklist Toggling in Markdown Preview
  const handleToggleChecklist = (lineIndex: number) => {
    const lines = content.split('\n');
    const targetLine = lines[lineIndex];
    if (targetLine.includes('- [ ]')) {
      lines[lineIndex] = targetLine.replace('- [ ]', '- [x]');
    } else if (targetLine.includes('- [x]')) {
      lines[lineIndex] = targetLine.replace('- [x]', '- [ ]');
    }
    const next = lines.join('\n');
    setContent(next);
    userPreferences.saveStudyNotes(noteId, next);
    setLastSavedTime('Saved');
  };

  // -----------------------------------------------------------
  // Flashcard Handlers
  // -----------------------------------------------------------
  const handleAutoExtractCards = () => {
    const pairs = userPreferences.parseFlashcardsFromText(content);
    if (pairs.length === 0) {
      setExtractNotice('No cards found. Use "Q: ... A: ..." or "term :: def" in your notes!');
      setTimeout(() => setExtractNotice(null), 4000);
      return;
    }

    const added = userPreferences.importExtractedCards(noteId, pairs);
    const updated = userPreferences.getFlashcards(noteId);
    setFlashcards(updated);
    setExtractNotice(
      added > 0 ? `+${added} new flashcards generated!` : 'All extracted cards already exist.'
    );
    setTimeout(() => setExtractNotice(null), 3000);
  };

  const handleAddManualCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    userPreferences.addFlashcard(noteId, newQuestion, newAnswer);
    const updated = userPreferences.getFlashcards(noteId);
    setFlashcards(updated);
    setNewQuestion('');
    setNewAnswer('');
    setIsAddingCard(false);
  };

  const handleDeleteCard = (cardId: string) => {
    userPreferences.deleteFlashcard(noteId, cardId);
    const updated = userPreferences.getFlashcards(noteId);
    setFlashcards(updated);
    if (currentCardIndex >= updated.length) {
      setCurrentCardIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleToggleMastered = (cardId: string) => {
    userPreferences.toggleCardMastered(noteId, cardId);
    const updated = userPreferences.getFlashcards(noteId);
    setFlashcards(updated);
  };

  const masteredCount = useMemo(
    () => flashcards.filter((c) => c.mastered).length,
    [flashcards]
  );

  if (!isOpen) return null;

  return (
    <div className="w-full sm:w-88 lg:w-96 flex flex-col border-l border-slate-200 bg-white h-full z-20 shrink-0 shadow-lg sm:shadow-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('notes');
              setIsQuizMode(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'notes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-accent-sage" />
            <span>Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'flashcards'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Flashcards</span>
            {flashcards.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-100 text-amber-800">
                {flashcards.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {activeTab === 'notes' && lastSavedTime && (
            <span className="text-[11px] text-emerald-600 font-medium mr-1 hidden xs:flex items-center gap-1">
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

      {/* ========================================================= */}
      {/* TAB 1: Lecture Notes & Interactive Markdown Preview       */}
      {/* ========================================================= */}
      {activeTab === 'notes' && (
        <>
          {/* Notes Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-white text-xs gap-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleInsertTemplate}
                className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
                title="Insert Structured Study Template"
              >
                <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                Template
              </Button>

              <button
                onClick={() => setViewMode((m) => (m === 'edit' ? 'preview' : 'edit'))}
                className={`h-7 px-2 rounded-md flex items-center gap-1 text-[11px] font-medium transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-accent-sage/15 text-accent-sage font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title={viewMode === 'edit' ? 'Preview rendered markdown & checklists' : 'Edit notes'}
              >
                {viewMode === 'edit' ? (
                  <>
                    <Eye className="w-3 h-3" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </>
                )}
              </button>
            </div>

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
                title="Download notes as Markdown file"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            </div>
          </div>

          {/* Body: Edit mode vs Interactive Checklist Preview */}
          <div className="flex-1 p-3 flex flex-col overflow-hidden">
            {viewMode === 'edit' ? (
              <textarea
                value={content}
                onChange={handleChange}
                placeholder="Type your lecture notes, formulas, or questions here...&#10;&#10;💡 Tips:&#10;• Use '- [ ]' for interactive revision checklists&#10;• Use 'Q: ... A: ...' to auto-generate flashcards&#10;• Use 'Concept :: Definition' for active recall"
                className="w-full flex-1 p-3 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200/80 focus:border-accent-sage focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-sage/30 resize-none transition-all"
              />
            ) : (
              <div className="w-full flex-1 p-3 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 bg-slate-50/50 rounded-xl border border-slate-200/80 overflow-y-auto space-y-2">
                {content.trim() ? (
                  content.split('\n').map((line, idx) => {
                    const trimmed = line.trim();

                    // Checkbox lines (- [ ] or - [x])
                    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
                      const isChecked = trimmed.startsWith('- [x]');
                      const text = trimmed.replace(/^-\s*\[[ x]\]\s*/, '');
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleChecklist(idx)}
                          className="flex items-start gap-2 py-0.5 cursor-pointer hover:bg-slate-100/60 rounded px-1 -mx-1 group transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-accent-sage focus:ring-accent-sage pointer-events-none"
                          />
                          <span
                            className={`text-xs ${
                              isChecked
                                ? 'line-through text-slate-400'
                                : 'text-slate-800 group-hover:text-slate-900'
                            }`}
                          >
                            {text}
                          </span>
                        </div>
                      );
                    }

                    // Headers
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="font-bold text-xs text-slate-700 pt-2">
                          {trimmed.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h3 key={idx} className="font-bold text-xs sm:text-sm text-slate-900 pt-3 pb-1 border-b border-slate-200/60">
                          {trimmed.replace('## ', '')}
                        </h3>
                      );
                    }
                    if (trimmed.startsWith('# ')) {
                      return (
                        <h2 key={idx} className="font-extrabold text-sm sm:text-base text-slate-900 pt-2">
                          {trimmed.replace('# ', '')}
                        </h2>
                      );
                    }

                    // Page citations / blockquotes (> [Page X]: ...)
                    if (trimmed.startsWith('>')) {
                      const quoteText = trimmed.replace(/^>\s*/, '');
                      const matchPage = quoteText.match(/\[Page\s*(\d+)\]/i);
                      const targetPage = matchPage ? parseInt(matchPage[1], 10) : null;

                      return (
                        <blockquote
                          key={idx}
                          className="border-l-2 border-accent-sage bg-accent-sage/10 pl-2.5 py-1.5 rounded-r my-1 text-[11px] sm:text-xs text-slate-700 italic flex items-center justify-between"
                        >
                          <span>{quoteText}</span>
                          {targetPage && onJumpToPage && (
                            <button
                              onClick={() => onJumpToPage(targetPage)}
                              className="ml-2 text-[10px] font-semibold text-accent-sage underline not-italic hover:text-accent-sage/80"
                            >
                              Jump
                            </button>
                          )}
                        </blockquote>
                      );
                    }

                    // Bullets
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      return (
                        <div key={idx} className="flex items-start gap-1.5 pl-2 text-xs text-slate-700">
                          <span className="text-slate-400">•</span>
                          <span>{trimmed.replace(/^[-*]\s*/, '')}</span>
                        </div>
                      );
                    }

                    // Empty lines
                    if (!trimmed) {
                      return <div key={idx} className="h-1.5" />;
                    }

                    // Regular text
                    return (
                      <p key={idx} className="text-xs text-slate-700">
                        {trimmed}
                      </p>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-8">
                    No notes written yet. Switch to "Edit" to write your lecture notes!
                  </p>
                )}
              </div>
            )}

            {/* Footer Word/Char Counter */}
            <div className="pt-2 px-1 text-[10px] text-slate-400 flex items-center justify-between">
              <span>{content.length} characters</span>
              <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* TAB 2: Flashcards Studio & Active Recall (RemNote style)  */}
      {/* ========================================================= */}
      {activeTab === 'flashcards' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          {/* Flashcard Action Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/80 bg-white gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoExtractCards}
              className="h-7 px-2 text-[11px] text-slate-700 font-medium hover:text-amber-600"
              title="Automatically scan notes for Q: ... A: ... and term :: def"
            >
              <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
              Auto-Extract
            </Button>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingCard((o) => !o)}
                className="h-7 px-2 text-[11px] text-slate-700 font-medium"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Card
              </Button>

              {flashcards.length > 0 && !isQuizMode && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsQuizMode(true);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className="h-7 px-2.5 text-[11px]"
                >
                  Start Quiz ({flashcards.length})
                </Button>
              )}
            </div>
          </div>

          {/* Notification banner */}
          {extractNotice && (
            <div className="mx-3 mt-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5 animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{extractNotice}</span>
            </div>
          )}

          {/* Add Card Form */}
          {isAddingCard && (
            <form
              onSubmit={handleAddManualCard}
              className="p-3 bg-white border-b border-slate-200/80 animate-in slide-in-from-top-2 duration-150 space-y-2"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Question</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g., What is Bernoulli's Principle?"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-accent-sage focus:ring-1 focus:ring-accent-sage/30 mt-0.5"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Answer</label>
                <input
                  type="text"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="e.g., An increase in the speed of a fluid occurs simultaneously with a decrease in pressure."
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-accent-sage focus:ring-1 focus:ring-accent-sage/30 mt-0.5"
                />
              </div>
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingCard(false)}
                  className="h-6 text-[11px]"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="h-6 text-[11px]">
                  Save Flashcard
                </Button>
              </div>
            </form>
          )}

          {/* Quiz Mode View */}
          {isQuizMode && flashcards.length > 0 ? (
            <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
              {/* Progress & Exit */}
              <div className="flex items-center justify-between pb-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 font-semibold">{masteredCount} Mastered</span>
                </div>
                <button
                  onClick={() => setIsQuizMode(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs underline"
                >
                  Exit Quiz
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-accent-sage transition-all duration-300"
                  style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                />
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped((f) => !f)}
                className="flex-1 min-h-[220px] cursor-pointer relative perspective-1000 group select-none"
              >
                <div
                  className={`w-full h-full duration-500 transform-style-3d relative rounded-2xl border transition-transform ${
                    isFlipped ? 'rotate-y-180 bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200 shadow-sm group-hover:border-accent-sage/60'
                  }`}
                  style={{
                    perspective: '1000px',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Front Side: Question */}
                  <div
                    className="absolute inset-0 p-5 flex flex-col justify-between backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                      QUESTION
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-slate-800 text-center leading-relaxed">
                      {flashcards[currentCardIndex].question}
                    </p>
                    <span className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                      <RotateCw className="w-3 h-3" /> Click card to reveal answer
                    </span>
                  </div>

                  {/* Back Side: Answer */}
                  <div
                    className="absolute inset-0 p-5 flex flex-col justify-between backface-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600">
                      ANSWER
                    </span>
                    <p className="text-sm sm:text-base font-medium text-slate-900 text-center leading-relaxed">
                      {flashcards[currentCardIndex].answer}
                    </p>
                    <span className="text-[10px] text-slate-400 text-center">
                      Rate below to progress
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Navigation & Mastery Rating */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Mark as need review
                      if (flashcards[currentCardIndex].mastered) {
                        handleToggleMastered(flashcards[currentCardIndex].id);
                      }
                      if (currentCardIndex < flashcards.length - 1) {
                        setCurrentCardIndex((i) => i + 1);
                        setIsFlipped(false);
                      } else {
                        setIsQuizMode(false);
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Needs Review
                  </button>

                  <button
                    onClick={() => {
                      // Mark as mastered
                      if (!flashcards[currentCardIndex].mastered) {
                        handleToggleMastered(flashcards[currentCardIndex].id);
                      }
                      if (currentCardIndex < flashcards.length - 1) {
                        setCurrentCardIndex((i) => i + 1);
                        setIsFlipped(false);
                      } else {
                        setIsQuizMode(false);
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    Mastered (Got it)
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                  <button
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setCurrentCardIndex((i) => Math.max(0, i - 1));
                      setIsFlipped(false);
                    }}
                    className="flex items-center gap-1 disabled:opacity-30 hover:text-slate-700"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    disabled={currentCardIndex === flashcards.length - 1}
                    onClick={() => {
                      setCurrentCardIndex((i) => Math.min(flashcards.length - 1, i + 1));
                      setIsFlipped(false);
                    }}
                    className="flex items-center gap-1 disabled:opacity-30 hover:text-slate-700"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Card List View */
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {flashcards.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-700">No Flashcards Yet</h5>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Click <strong>"Auto-Extract"</strong> to generate flashcards from your study notes, or click <strong>"+ Add Card"</strong> to create your first card.
                  </p>
                </div>
              ) : (
                flashcards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:border-accent-sage/50 transition-all text-xs space-y-1.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                        <span className="font-semibold text-slate-800">{card.question}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => handleToggleMastered(card.id)}
                          title={card.mastered ? 'Mastered' : 'Mark as Mastered'}
                          className={`p-1 rounded-md transition-colors ${
                            card.mastered
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-slate-300 hover:text-emerald-500'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          title="Delete card"
                          className="p-1 rounded-md text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 pl-4 border-l-2 border-slate-100">
                      {card.answer}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
