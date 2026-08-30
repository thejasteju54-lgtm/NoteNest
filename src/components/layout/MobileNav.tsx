import React from 'react';
import { useNoteNest } from '@/context/NoteNestContext';
import { LayoutDashboard, Folder, Upload, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activePage, navigateTo, openUploadModal, openSubjectModal } = useNoteNest();

  const isDashboard = activePage.type === 'dashboard';
  const isSubject = activePage.type === 'subject';
  const isSettings = activePage.type === 'settings';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200/90 px-3 py-2 shadow-lg safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard Tab */}
        <button
          type="button"
          onClick={() => navigateTo({ type: 'dashboard' })}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isDashboard
              ? 'text-accent-sage font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${isDashboard ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Subjects / New Subject Tab */}
        <button
          type="button"
          onClick={() => {
            if (isSubject) {
              navigateTo({ type: 'dashboard' });
            } else {
              openSubjectModal();
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isSubject
              ? 'text-accent-sage font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Folder className={`w-5 h-5 ${isSubject ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Subjects</span>
        </button>

        {/* Center Floating Action Button: Quick Upload */}
        <div className="-mt-5 relative">
          <button
            type="button"
            onClick={() => openUploadModal()}
            aria-label="Upload PDF Note"
            className="w-12 h-12 rounded-2xl bg-accent-sage text-white flex items-center justify-center shadow-lg shadow-accent-sage/35 hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
          >
            <Upload className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Settings Tab */}
        <button
          type="button"
          onClick={() => navigateTo({ type: 'settings' })}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isSettings
              ? 'text-accent-sage font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className={`w-5 h-5 ${isSettings ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Settings</span>
        </button>
      </div>
    </div>
  );
};
