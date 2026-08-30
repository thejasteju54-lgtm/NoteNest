import { describe, it, expect } from 'vitest';
import {
  validateStudentEmail,
  validateStrongPassword,
  evaluatePasswordStrength,
} from '@/utils/authValidation';

describe('Super-Strong Authentication & Security Validation', () => {
  describe('Email & Disposable Domain Validation', () => {
    it('should reject empty or missing email', () => {
      const res = validateStudentEmail('');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Email address is required');
    });

    it('should reject improperly formatted emails', () => {
      expect(validateStudentEmail('notanemail').isValid).toBe(false);
      expect(validateStudentEmail('test@').isValid).toBe(false);
      expect(validateStudentEmail('@domain.com').isValid).toBe(false);
      expect(validateStudentEmail('test@domain').isValid).toBe(false);
    });

    it('should block known disposable and temporary email domains', () => {
      const disposableEmails = [
        'attacker@mailinator.com',
        'fake@tempmail.com',
        'spammer@temp-mail.org',
        'bot@10minutemail.com',
        'test@guerrillamail.com',
        'hacker@yopmail.com',
        'user@trashmail.com',
      ];

      for (const email of disposableEmails) {
        const result = validateStudentEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Disposable and temporary email');
      }
    });

    it('should accept legitimate student and personal email addresses', () => {
      const validEmails = [
        'student@stanford.edu',
        'alex.chen@mit.edu',
        'sarah_smith@university.ac.uk',
        'john.doe@gmail.com',
        'academic@outlook.com',
      ];

      for (const email of validEmails) {
        const result = validateStudentEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });
  });

  describe('Strong Password Policy & Strength Evaluation', () => {
    it('should reject passwords shorter than 8 characters', () => {
      const res = validateStrongPassword('Ab1!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('at least 8 characters');
    });

    it('should reject passwords missing uppercase letters', () => {
      const res = validateStrongPassword('abcdef123!@');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('uppercase letter');
    });

    it('should reject passwords missing lowercase letters', () => {
      const res = validateStrongPassword('ABCDEF123!@');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('lowercase letter');
    });

    it('should reject passwords missing digits', () => {
      const res = validateStrongPassword('Abcdefgh!@#');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('digit');
    });

    it('should reject passwords missing special characters', () => {
      const res = validateStrongPassword('Abcdefgh1234');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('special character');
    });

    it('should accept passwords meeting all 5 security criteria', () => {
      const validPasswords = [
        'SecurePass123!',
        'Student#2026@Nest',
        'MathNotes$99',
      ];

      for (const pass of validPasswords) {
        const res = validateStrongPassword(pass);
        expect(res.isValid).toBe(true);
        expect(res.error).toBeUndefined();
      }
    });

    it('should evaluate password strength accurately', () => {
      const weak = evaluatePasswordStrength('abc');
      expect(weak.score).toBeLessThanOrEqual(1);

      const strong = evaluatePasswordStrength('UltraSecurePass123!#');
      expect(strong.score).toBe(4);
      expect(strong.label).toBe('Strong');
      expect(strong.hasMinLength).toBe(true);
      expect(strong.hasUppercase).toBe(true);
      expect(strong.hasLowercase).toBe(true);
      expect(strong.hasNumber).toBe(true);
      expect(strong.hasSpecialChar).toBe(true);
    });
  });
});
