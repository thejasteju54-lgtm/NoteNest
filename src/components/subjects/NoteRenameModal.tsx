import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Note } from '@/types/note';
import { useNoteNest } from '@/context/NoteNestContext';

export interface NoteRenameModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

export const NoteRenameModal: React.FC<NoteRenameModalProps> = ({ note, isOpen, onClose }) => {
  const { renameNote } = useNoteNest();
  const [title, setTitle] = useState(note.title);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(note.title);
    setError('');
  }, [note, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a note title.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await renameNote(note.id, trimmed);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to rename note.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename PDF Note"
      description="Update the display title of this study document."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Note Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
          required
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};
