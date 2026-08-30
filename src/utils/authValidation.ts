/**
 * Comprehensive Email and Password Validation Utilities for NoteNest
 */

// List of common disposable / temporary email domains to prevent spam and fake accounts
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'trashmail.com',
  'trashmail.net',
  'getairmail.com',
  'mohmal.com',
  'dispostable.com',
  'fakeinbox.com',
  'maildrop.cc',
  'inboxkitten.com',
  'throwawaymail.com',
  'generator.email',
  'mytemp.email',
  'crazymailing.com',
  'burnermail.io',
  'nada.ltd',
  'fakemailgenerator.com',
]);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

/**
 * Validates email format, domain structure, and blocks disposable/temporary email providers.
 */
export function validateStudentEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }

  // Strict RFC 5322 standard email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid, properly formatted email address.' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email format.' };
  }

  const domain = parts[1];

  // Block disposable domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Disposable and temporary email addresses are not permitted. Please use a legitimate personal or university email.',
    };
  }

  // Ensure domain has at least one dot and valid TLD length >= 2
  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts.some((p) => p.length === 0)) {
    return { isValid: false, error: 'Please enter an email with a valid domain name.' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: 'The email domain ending is invalid.' };
  }

  return { isValid: true };
}

/**
 * Evaluates password strength and strict security requirements:
 * - Minimum 8 characters
 * - Uppercase letter (A-Z)
 * - Lowercase letter (a-z)
 * - Number (0-9)
 * - Special character (!@#$%^&*...)
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  let passedCriteria = 0;
  if (hasMinLength) passedCriteria++;
  if (hasUppercase && hasLowercase) passedCriteria++;
  if (hasNumber) passedCriteria++;
  if (hasSpecialChar) passedCriteria++;

  let label: PasswordStrength['label'] = 'Weak';
  if (passedCriteria === 4 && password.length >= 10) {
    label = 'Strong';
  } else if (passedCriteria >= 3) {
    label = 'Good';
  } else if (passedCriteria >= 2) {
    label = 'Fair';
  }

  return {
    score: passedCriteria,
    label,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };
}

/**
 * Validates that a password satisfies all mandatory security rules.
 */
export function validateStrongPassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one digit (0-9).' };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (e.g. !@#$%^&*).' };
  }

  return { isValid: true };
}
