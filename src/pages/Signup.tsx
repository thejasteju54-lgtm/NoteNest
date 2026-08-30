import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LogoIcon } from '@/components/common/Logo';
import {
  evaluatePasswordStrength,
  validateStudentEmail,
} from '@/utils/authValidation';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

interface SignupProps {
  onNavigateToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigateToLogin }) => {
  const { signUp, resendConfirmationEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const passwordStrength = evaluatePasswordStrength(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const emailCheck = validateStudentEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Invalid email address.');
      return;
    }

    if (passwordStrength.score < 4 || password.length < 8) {
      setError('Please create a stronger password meeting all security requirements below.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const result = await signUp(email, password, name);
      if (result.emailConfirmationRequired) {
        setConfirmationSent(true);
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendStatus('sending');
    try {
      await resendConfirmationEmail(email);
      setResendStatus('sent');
      setResendCooldown(60);
      setTimeout(() => setResendStatus('idle'), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email.');
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <LogoIcon sizeClass="w-13 h-13 rounded-2xl" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your NoteNest Account
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Verified academic note organization secured by Supabase Auth.
        </p>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200/90">
          {confirmationSent ? (
            /* Confirmation Sent Screen */
            <div className="text-center space-y-4 py-2 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-subtle">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Verify Your Email Address</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We've sent a secure verification link to <br />
                  <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1 font-mono">
                    {email}
                  </span>
                </p>
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-left flex items-start gap-2.5 text-[11px] text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    To protect your notes and prevent unauthorized access, you must verify your real email inbox before signing in.
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={onNavigateToLogin}
                >
                  Proceed to Sign In
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resendStatus === 'sending'}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${resendStatus === 'sending' ? 'animate-spin' : ''}`} />}
                >
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : resendStatus === 'sent'
                    ? 'Confirmation Email Sent!'
                    : 'Resend Verification Link'}
                </Button>
              </div>
            </div>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Full Name"
                placeholder="e.g. Maya Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                required
                autoFocus
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                helperText="Must be a real email address (temporary domains are blocked)."
                required
              />

              {/* Password Field */}
              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />

                {/* Password Strength Meter & Interactive Checklist */}
                {password && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-500">Password Strength:</span>
                      <span
                        className={
                          passwordStrength.label === 'Strong'
                            ? 'text-emerald-600'
                            : passwordStrength.label === 'Good'
                            ? 'text-teal-600'
                            : passwordStrength.label === 'Fair'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }
                      >
                        {passwordStrength.label}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score === 4
                            ? 'w-full bg-emerald-500'
                            : passwordStrength.score === 3
                            ? 'w-3/4 bg-teal-500'
                            : passwordStrength.score === 2
                            ? 'w-1/2 bg-amber-500'
                            : 'w-1/4 bg-rose-500'
                        }`}
                      />
                    </div>

                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        {passwordStrength.hasMinLength ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {passwordStrength.hasUppercase && passwordStrength.hasLowercase ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span>Upper & lowercase</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {passwordStrength.hasNumber ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span>At least 1 number</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {passwordStrength.hasSpecialChar ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span>Special character (!@#$)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />
                {confirmPassword && (
                  <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                    {passwordsMatch ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Verified Account
                </Button>
              </div>
            </form>
          )}

          {!confirmationSent && (
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-semibold text-accent-sage hover:text-accent-sage-hover hover:underline transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Security Badge Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-6">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-sage" />
          <span>Email verification and strong password enforcement active</span>
        </div>
      </div>
    </div>
  );
};
