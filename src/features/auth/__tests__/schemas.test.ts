import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  otpSchema,
  registerSchema,
  resetPasswordSchema,
} from '../types';

/**
 * The zod schemas are the client-side validation contract for every auth form.
 * They are pure and fast, so they get the densest coverage in the suite —
 * including the adversarial inputs (injection / unicode / emoji / whitespace)
 * called out in the QA spec.
 */
const firstError = (result: { success: boolean; error?: any }): string | undefined =>
  result.success ? undefined : result.error.issues[0]?.message;

describe('loginSchema', () => {
  it('accepts a valid email + password and defaults rememberMe to true', () => {
    const result = loginSchema.safeParse({
      email: 'rajesh@abcpoultry.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rememberMe).toBe(true);
    }
  });

  it('trims surrounding whitespace from the email', () => {
    const result = loginSchema.safeParse({
      email: '  rajesh@abcpoultry.com  ',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('rajesh@abcpoultry.com');
    }
  });

  it('requires the email', () => {
    expect(firstError(loginSchema.safeParse({ email: '', password: 'Password123' }))).toBe(
      'Email is required',
    );
  });

  it.each([
    'plainaddress',
    'missing@tld',
    '@no-local.com',
    'spaces in@email.com',
    'two@@at.com',
  ])('rejects malformed email "%s"', email => {
    const result = loginSchema.safeParse({ email, password: 'Password123' });
    expect(result.success).toBe(false);
  });

  it('rejects an email longer than 255 chars', () => {
    const email = `${'a'.repeat(250)}@x.com`;
    expect(loginSchema.safeParse({ email, password: 'Password123' }).success).toBe(false);
  });

  it('requires a password', () => {
    expect(
      firstError(loginSchema.safeParse({ email: 'rajesh@abcpoultry.com', password: '' })),
    ).toBe('Password is required');
  });

  it('enforces the minimum password length but NOT the strong-password policy', () => {
    // Existing accounts may predate the strong-password policy, so login only
    // checks length — a lowercase-only 8-char password must still be accepted.
    expect(
      loginSchema.safeParse({ email: 'rajesh@abcpoultry.com', password: 'short' }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: 'rajesh@abcpoultry.com', password: 'alllowercase' })
        .success,
    ).toBe(true);
  });

  it.each([
    ['SQL injection', "' OR '1'='1"],
    ['script injection', '<script>alert(1)</script>'],
    ['emoji', '😀😀😀😀😀😀😀😀'],
  ])('treats %s in the password as an opaque 8+ char string (no crash)', (_l, password) => {
    const result = loginSchema.safeParse({ email: 'rajesh@abcpoultry.com', password });
    expect(result.success).toBe(true);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'rajesh@abcpoultry.com' }).success).toBe(
      true,
    );
  });

  it('rejects an empty email', () => {
    expect(firstError(forgotPasswordSchema.safeParse({ email: '' }))).toBe(
      'Email is required',
    );
  });

  it('rejects an invalid email', () => {
    expect(firstError(forgotPasswordSchema.safeParse({ email: 'nope' }))).toBe(
      'Enter a valid email address',
    );
  });
});

describe('otpSchema', () => {
  it('accepts a 6-digit code', () => {
    expect(otpSchema.safeParse({ otp: '123456' }).success).toBe(true);
  });

  it('rejects an empty OTP', () => {
    expect(firstError(otpSchema.safeParse({ otp: '' }))).toBe(
      'Enter the OTP sent to your email',
    );
  });

  it('rejects a partial (5-digit) OTP', () => {
    expect(firstError(otpSchema.safeParse({ otp: '12345' }))).toBe('OTP must be 6 digits');
  });

  it('rejects a 7-digit OTP', () => {
    expect(firstError(otpSchema.safeParse({ otp: '1234567' }))).toBe('OTP must be 6 digits');
  });

  it('rejects an OTP containing non-digits', () => {
    expect(firstError(otpSchema.safeParse({ otp: '12a456' }))).toBe(
      'OTP must contain digits only',
    );
  });
});

describe('resetPasswordSchema', () => {
  const valid = { newPassword: 'NewPass123', confirmPassword: 'NewPass123' };

  it('accepts a strong, matching password pair', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an empty new password', () => {
    expect(
      resetPasswordSchema.safeParse({ newPassword: '', confirmPassword: '' }).success,
    ).toBe(false);
  });

  it('rejects a weak new password (no uppercase/number)', () => {
    expect(
      firstError(
        resetPasswordSchema.safeParse({
          newPassword: 'weakpassword',
          confirmPassword: 'weakpassword',
        }),
      ),
    ).toBe('Password must include uppercase, lowercase and a number');
  });

  it('rejects when the passwords do not match (error on confirmPassword)', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'NewPass123',
      confirmPassword: 'Different123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Passwords do not match');
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });

  it('requires the confirm field even when the new password is valid', () => {
    expect(
      resetPasswordSchema.safeParse({ newPassword: 'NewPass123', confirmPassword: '' })
        .success,
    ).toBe(false);
  });
});

describe('changePasswordSchema (forced first-login change)', () => {
  const base = {
    currentPassword: 'OldPass123',
    otp: '123456',
    newPassword: 'NewPass123',
    confirmPassword: 'NewPass123',
  };

  it('accepts a fully valid payload', () => {
    expect(changePasswordSchema.safeParse(base).success).toBe(true);
  });

  it('requires the current password', () => {
    expect(
      firstError(changePasswordSchema.safeParse({ ...base, currentPassword: '' })),
    ).toBe('Current password is required');
  });

  it('requires a valid 6-digit OTP', () => {
    expect(changePasswordSchema.safeParse({ ...base, otp: '12' }).success).toBe(false);
  });

  it('rejects a new password identical to the current password', () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      currentPassword: 'NewPass123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path[0] === 'newPassword')).toBe(true);
    }
  });

  it('rejects a mismatched confirmation', () => {
    expect(
      changePasswordSchema.safeParse({ ...base, confirmPassword: 'Mismatch123' }).success,
    ).toBe(false);
  });
});

describe('registerSchema (forward-compat placeholder)', () => {
  const valid = {
    fullName: 'Rajesh Kumar',
    email: 'rajesh@abcpoultry.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  };

  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a one-word / too-short full name', () => {
    expect(registerSchema.safeParse({ ...valid, fullName: 'Jo' }).success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    expect(
      registerSchema.safeParse({ ...valid, confirmPassword: 'Other123' }).success,
    ).toBe(false);
  });
});
