import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { User, LogOut, ShieldCheck } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Account"
      description="Your NoteNest account is secured by Supabase authentication."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-sage text-white flex items-center justify-center font-bold text-sm">
              {user?.avatarInitials || <User className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Active
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await signOut();
              onClose();
            }}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Modal>
  );
};
