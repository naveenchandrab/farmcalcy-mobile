import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@constants';

/**
 * Password policy for newly chosen passwords (reset / change / force-change).
 *
 * The backend enforces only length (min 8 / max 128 — see ResetPasswordDto and
 * ChangePasswordDto in farmseasy-api). These client-side rules are a strict
 * superset of the backend contract: every password that passes here also passes
 * server validation, so the client never sends a request the server will reject
 * on policy grounds. The extra character-class rules raise the baseline strength
 * without ever blocking a server-valid password the user could otherwise set.
 */

export interface PasswordRule {
  readonly id: string;
  readonly label: string;
  readonly test: (value: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: value => value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter (A–Z)',
    test: value => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter (a–z)',
    test: value => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number (0–9)',
    test: value => /\d/.test(value),
  },
] as const;

/** A password is acceptable only when every required rule passes. */
export const isPasswordValid = (value: string): boolean =>
  PASSWORD_RULES.every(rule => rule.test(value));

export type PasswordStrength = 'weak' | 'fair' | 'strong';

export interface PasswordStrengthResult {
  readonly score: number; // 0–4
  readonly level: PasswordStrength;
}

/**
 * Lightweight strength estimate used only to drive the strength meter UI.
 * It is presentation-only and never gates submission — `isPasswordValid` does.
 */
export const evaluatePasswordStrength = (value: string): PasswordStrengthResult => {
  if (!value) {
    return { score: 0, level: 'weak' };
  }

  let score = 0;
  if (value.length >= PASSWORD_MIN_LENGTH) {
    score += 1;
  }
  if (value.length >= 12) {
    score += 1;
  }
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) {
    score += 1;
  }
  if (/\d/.test(value)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(value)) {
    score += 1;
  }

  const normalized = Math.min(score, 4);
  const level: PasswordStrength = normalized <= 1 ? 'weak' : normalized <= 3 ? 'fair' : 'strong';

  return { score: normalized, level };
};
