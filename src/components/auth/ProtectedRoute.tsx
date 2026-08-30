import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Login } from '@/pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigateToSignup: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onNavigateToSignup }) => {
  const { user, session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-accent-sage/20 text-accent-sage flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Restoring Session...
        </p>
      </div>
    );
  }

  if (!user || !session) {
    return <Login onNavigateToSignup={onNavigateToSignup} />;
  }

  return <>{children}</>;
};
