import {
  PASSWORD_RULES,
  evaluatePasswordStrength,
  isPasswordValid,
} from '../utils/passwordPolicy';

/**
 * Password policy is the security-critical gate for every "choose a new
 * password" flow (reset / change / force-change). These tests pin the exact
 * rule set so a future refactor cannot silently weaken it.
 */
describe('passwordPolicy', () => {
  describe('isPasswordValid', () => {
    it('accepts a password meeting every rule', () => {
      expect(isPasswordValid('Password123')).toBe(true);
    });

    it.each([
      ['too short', 'Pass1'],
      ['no uppercase', 'password123'],
      ['no lowercase', 'PASSWORD123'],
      ['no number', 'PasswordOnly'],
      ['empty', ''],
    ])('rejects a password that is %s', (_label, value) => {
      expect(isPasswordValid(value)).toBe(false);
    });

    it('accepts a 128-character password (max length boundary)', () => {
      const value = `Aa1${'x'.repeat(125)}`;
      expect(value).toHaveLength(128);
      expect(isPasswordValid(value)).toBe(true);
    });

    it('rejects a 129-character password (over max length)', () => {
      const value = `Aa1${'x'.repeat(126)}`;
      expect(value).toHaveLength(129);
      expect(isPasswordValid(value)).toBe(false);
    });

    it('accepts an exactly-8-character password (min boundary)', () => {
      expect(isPasswordValid('Abcdef12')).toBe(true);
    });
  });

  describe('PASSWORD_RULES', () => {
    it('exposes four stable, identifiable rules', () => {
      expect(PASSWORD_RULES.map(rule => rule.id)).toEqual([
        'length',
        'uppercase',
        'lowercase',
        'number',
      ]);
    });
  });

  describe('evaluatePasswordStrength', () => {
    it('scores an empty password as 0 / weak', () => {
      expect(evaluatePasswordStrength('')).toEqual({ score: 0, level: 'weak' });
    });

    it('rates a short simple password as weak', () => {
      expect(evaluatePasswordStrength('abc').level).toBe('weak');
    });

    it('rates a policy-valid 11-char password as at least fair', () => {
      const { level } = evaluatePasswordStrength('Password123');
      expect(['fair', 'strong']).toContain(level);
    });

    it('rates a long mixed password with a symbol as strong', () => {
      expect(evaluatePasswordStrength('Password123!extra').level).toBe('strong');
    });

    it('caps the score at 4', () => {
      const { score } = evaluatePasswordStrength('Password123!ABCdef456');
      expect(score).toBeLessThanOrEqual(4);
    });
  });
});
