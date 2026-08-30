import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LogoIcon } from '@/components/common/Logo';
import { validateStudentEmail } from '@/utils/authValidation';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface LoginProps {
  onNavigateToSignup: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToSignup }) => {
  const { signIn, resendConfirmationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnconfirmed(false);
    setResendMessage('');

    const emailCheck = validateStudentEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err: any) {
      const msg = err.message || 'Failed to sign in. Please check your credentials.';
      setError(msg);
      if (msg.toLowerCase().includes('not been confirmed') || msg.toLowerCase().includes('email not confirmed')) {
        setIsUnconfirmed(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendLink = async () => {
    if (resendCooldown > 0 || !email) return;
    try {
      await resendConfirmationEmail(email);
      setResendMessage('Verification email resent! Please check your inbox and spam folder.');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <LogoIcon sizeClass="w-13 h-13 rounded-2xl" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to NoteNest
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Access your private academic notes and study nest.
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>{error}</span>
                  {isUnconfirmed && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleResendLink}
                        disabled={resendCooldown > 0}
                        className="font-bold underline hover:text-rose-900 transition-colors flex items-center gap-1 mt-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : 'Resend Verification Link'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {resendMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resendMessage}</span>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onNavigateToSignup}
                className="font-semibold text-accent-sage hover:text-accent-sage-hover hover:underline transition-colors"
              >
                Create a verified student account
              </button>
            </p>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-6">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-sage" />
          <span>Protected by Supabase Row-Level Security & Auth</span>
        </div>
      </div>
    </div>
  );
};
