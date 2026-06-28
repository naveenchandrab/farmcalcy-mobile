import { maskEmail } from '../utils/format';

/** maskEmail is cosmetic but appears on the OTP screen — keep it predictable. */
describe('maskEmail', () => {
  it('masks the local part beyond the first two characters', () => {
    expect(maskEmail('rajesh@abcpoultry.com')).toBe('ra••••@abcpoultry.com');
  });

  it('keeps at least one mask bullet for very short local parts', () => {
    expect(maskEmail('a@b.com')).toBe('a•@b.com');
  });

  it('trims surrounding whitespace before masking', () => {
    expect(maskEmail('  rajesh@abcpoultry.com  ')).toBe('ra••••@abcpoultry.com');
  });

  it('returns the input unchanged when there is no @ sign', () => {
    expect(maskEmail('not-an-email')).toBe('not-an-email');
  });

  it('returns the input unchanged when @ is the first character', () => {
    expect(maskEmail('@domain.com')).toBe('@domain.com');
  });
});
