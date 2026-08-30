import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { SUBJECT_COLORS, ColorOption } from '@/config/constants';
import { useNoteNest } from '@/context/NoteNestContext';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export const SubjectModal: React.FC = () => {
  const { isSubjectModalOpen, closeSubjectModal, editingSubject, createSubject, updateSubject } =
    useNoteNest();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColorId, setSelectedColorId] = useState<string>(SUBJECT_COLORS[0].id);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setDescription(editingSubject.description || '');
      setSelectedColorId(editingSubject.colorId || SUBJECT_COLORS[0].id);
    } else {
      setName('');
      setDescription('');
      setSelectedColorId(SUBJECT_COLORS[0].id);
    }
    setError('');
  }, [editingSubject, isSubjectModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a subject name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, trimmed, selectedColorId, description);
      } else {
        await createSubject(trimmed, selectedColorId, description);
      }
      closeSubjectModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save subject.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isSubjectModalOpen}
      onClose={closeSubjectModal}
      title={editingSubject ? 'Rename Subject' : 'Create New Subject'}
      description={
        editingSubject
          ? 'Update the subject folder name and color accent.'
          : 'Create a dedicated folder for your class notes and PDFs.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject Name"
          placeholder="e.g. Mathematics, Physics, Data Structures"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
          required
        />

        <Input
          label="Description (Optional)"
          placeholder="e.g. Semester 1, Prof. Davis, Unit 1-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Color Palette Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 tracking-wide">
            Folder Color Accent
          </label>
          <div className="flex items-center gap-3">
            {SUBJECT_COLORS.map((color: ColorOption) => {
              const isSelected = selectedColorId === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColorId(color.id)}
                  aria-label={`Select ${color.name}`}
                  className={clsx(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 border',
                    isSelected
                      ? 'ring-2 ring-slate-900 ring-offset-2 scale-105'
                      : 'hover:scale-105 border-transparent'
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeSubjectModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
          >
            {editingSubject ? 'Save Changes' : 'Create Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
