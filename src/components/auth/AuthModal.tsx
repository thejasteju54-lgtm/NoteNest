import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, demoAccounts, switchDemoAccount, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'demo' | 'custom'>('demo');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      setError('Please fill in both name and email.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await register(customName, customEmail);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Demo Accounts"
      description="NoteNest runs in Local Demo Mode. Each profile maintains isolated notes and subjects."
      maxWidth="md"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-100 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('demo')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'demo'
              ? 'border-accent-sage text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Preset Demo Students
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'custom'
              ? 'border-accent-sage text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Create Custom Profile
        </button>
      </div>

      {activeTab === 'demo' ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 mb-2">
            Select a preset student profile to explore pre-populated college subjects and lecture notes:
          </p>
          <div className="space-y-2.5">
            {demoAccounts.map((account) => {
              const isActive = user?.id === account.id;
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={async () => {
                    await switchDemoAccount(account.id);
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isActive
                      ? 'border-accent-sage bg-accent-sage/10 ring-1 ring-accent-sage text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                      {account.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{account.name}</p>
                      <p className="text-[11px] text-slate-500">{account.role} • {account.email}</p>
                    </div>
                  </div>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-accent-sage shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleCustomSubmit} className="space-y-3.5">
          <Input
            label="Your Name"
            placeholder="e.g. Maya Chen"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            required
          />
          <Input
            label="Student Email"
            type="email"
            placeholder="e.g. maya.chen@university.edu"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            required
          />

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Start with Profile
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
