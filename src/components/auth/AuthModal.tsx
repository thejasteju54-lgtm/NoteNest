import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { CheckCircle2, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'signin' | 'signup' | 'forgot' | 'demo';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isSupabase, demoAccounts, switchDemoAccount, login, register, resetPassword, loginWithGoogle } =
    useAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<AuthTab>(isSupabase ? 'signin' : 'demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setResetSent(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await login(email, isSupabase ? password : name);
      success('Welcome back', `Signed in as ${email}`);
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please enter your full name and student email.');
      return;
    }
    if (isSupabase && (!password || password.length < 6)) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await register(name, email, password);
      success('Account Created', `Welcome to NoteNest, ${name}!`);
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await resetPassword(email);
      setResetSent(true);
      success('Reset Link Sent', 'Check your email for password reset instructions.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in error.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title={
        activeTab === 'signin'
          ? 'Sign in to NoteNest'
          : activeTab === 'signup'
          ? 'Create NoteNest Account'
          : activeTab === 'forgot'
          ? 'Reset your Password'
          : 'User Profile & Demo Accounts'
      }
      description={
        isSupabase
          ? 'Access your academic subject folders and PDF notes from any device.'
          : 'NoteNest is running in Local Demo Mode. Each profile maintains isolated notes.'
      }
      maxWidth="md"
    >
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-100 mb-5 overflow-x-auto">
        {isSupabase && (
          <>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setError('');
              }}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'signin'
                  ? 'border-accent-sage text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'signup'
                  ? 'border-accent-sage text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            setActiveTab('demo');
            setError('');
          }}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'demo'
              ? 'border-accent-sage text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          {isSupabase ? 'Offline Demo Profiles' : 'Preset Demo Students'}
        </button>
      </div>

      {/* Tab: Sign In */}
      {activeTab === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            label="Student Email"
            type="email"
            placeholder="student@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoFocus
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('forgot');
                  setError('');
                }}
                className="text-[11px] font-semibold text-accent-sage hover:text-accent-sage-hover"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

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

          {/* Google OAuth Option */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="md"
            type="button"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className="text-accent-sage font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </form>
      )}

      {/* Tab: Sign Up */}
      {activeTab === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Maya Chen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon className="w-4 h-4" />}
            required
            autoFocus
          />

          <Input
            label="Student Email"
            type="email"
            placeholder="maya.chen@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          {isSupabase && (
            <Input
              label="Password (min 6 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          )}

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <Button
            variant="primary"
            size="md"
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className="text-accent-sage font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </form>
      )}

      {/* Tab: Forgot Password */}
      {activeTab === 'forgot' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {resetSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-emerald-900">Check your inbox</p>
              <p className="text-xs text-emerald-700">
                We've sent a password reset link to <b>{email}</b>. Follow the link to choose a new password.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setActiveTab('signin')}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500">
                Enter your student email and we'll send you instructions to reset your password.
              </p>
              <Input
                label="Student Email"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoFocus
              />

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('signin')}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                  Send Reset Link
                </Button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Tab: Demo Accounts */}
      {activeTab === 'demo' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 mb-2">
            Select a preset student profile to explore pre-populated college subjects and lecture notes in local storage:
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
                      <p className="text-[11px] text-slate-500">
                        {account.role} • {account.email}
                      </p>
                    </div>
                  </div>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-accent-sage shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};
