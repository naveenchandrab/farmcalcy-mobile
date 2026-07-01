import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  otpSchema,
  registerTenantSchema,
  registerStaffSchema,
  registerFarmOwnerSchema,
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
      identifier: 'rajesh@abcpoultry.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rememberMe).toBe(true);
    }
  });

  it('accepts a phone number as the identifier', () => {
    expect(
      loginSchema.safeParse({ identifier: '+919876543210', password: 'Password123' }).success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({ identifier: '9876543210', password: 'Password123' }).success,
    ).toBe(true);
  });

  it('trims surrounding whitespace from the identifier', () => {
    const result = loginSchema.safeParse({
      identifier: '  rajesh@abcpoultry.com  ',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identifier).toBe('rajesh@abcpoultry.com');
    }
  });

  it('requires the identifier', () => {
    expect(firstError(loginSchema.safeParse({ identifier: '', password: 'Password123' }))).toBe(
      'Email or mobile number is required',
    );
  });

  it.each(['plainaddress', 'missing@tld', '@no-local.com', 'spaces in@email.com', 'two@@at.com'])(
    'rejects an identifier that is neither a valid email nor phone "%s"',
    identifier => {
      const result = loginSchema.safeParse({ identifier, password: 'Password123' });
      expect(result.success).toBe(false);
    },
  );

  it('rejects an identifier longer than 255 chars', () => {
    const identifier = `${'a'.repeat(250)}@x.com`;
    expect(loginSchema.safeParse({ identifier, password: 'Password123' }).success).toBe(false);
  });

  it('requires a password', () => {
    expect(
      firstError(loginSchema.safeParse({ identifier: 'rajesh@abcpoultry.com', password: '' })),
    ).toBe('Password is required');
  });

  it('enforces the minimum password length but NOT the strong-password policy', () => {
    // Existing accounts may predate the strong-password policy, so login only
    // checks length — a lowercase-only 8-char password must still be accepted.
    expect(
      loginSchema.safeParse({ identifier: 'rajesh@abcpoultry.com', password: 'short' }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ identifier: 'rajesh@abcpoultry.com', password: 'alllowercase' })
        .success,
    ).toBe(true);
  });

  it.each([
    ['SQL injection', "' OR '1'='1"],
    ['script injection', '<script>alert(1)</script>'],
    ['emoji', '😀😀😀😀😀😀😀😀'],
  ])('treats %s in the password as an opaque 8+ char string (no crash)', (_l, password) => {
    const result = loginSchema.safeParse({ identifier: 'rajesh@abcpoultry.com', password });
    expect(result.success).toBe(true);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'rajesh@abcpoultry.com' }).success).toBe(true);
  });

  it('rejects an empty email', () => {
    expect(firstError(forgotPasswordSchema.safeParse({ email: '' }))).toBe('Email is required');
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
    expect(firstError(otpSchema.safeParse({ otp: '' }))).toBe('Enter the OTP sent to your email');
  });

  it('rejects a partial (5-digit) OTP', () => {
    expect(firstError(otpSchema.safeParse({ otp: '12345' }))).toBe('OTP must be 6 digits');
  });

  it('rejects a 7-digit OTP', () => {
    expect(firstError(otpSchema.safeParse({ otp: '1234567' }))).toBe('OTP must be 6 digits');
  });

  it('rejects an OTP containing non-digits', () => {
    expect(firstError(otpSchema.safeParse({ otp: '12a456' }))).toBe('OTP must contain digits only');
  });
});

describe('resetPasswordSchema', () => {
  const valid = { newPassword: 'NewPass123', confirmPassword: 'NewPass123' };

  it('accepts a strong, matching password pair', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an empty new password', () => {
    expect(resetPasswordSchema.safeParse({ newPassword: '', confirmPassword: '' }).success).toBe(
      false,
    );
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
      resetPasswordSchema.safeParse({ newPassword: 'NewPass123', confirmPassword: '' }).success,
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
    expect(firstError(changePasswordSchema.safeParse({ ...base, currentPassword: '' }))).toBe(
      'Current password is required',
    );
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

const validAddress = {
  addressLine1: '12 Industrial Estate',
  district: 'Coimbatore',
  state: 'Karnataka',
  pincode: '641001',
};

describe('registerTenantSchema', () => {
  const valid = {
    companyName: 'ABC Poultry Farms',
    companyEmail: 'info@abcpoultry.com',
    companyPhone: '+919876543210',
    ...validAddress,
    firstName: 'Rajesh',
    lastName: 'Kumar',
    adminEmail: 'rajesh@abcpoultry.com',
    phoneNumber: '+919876543211',
  };

  it('accepts a valid tenant registration (GST optional)', () => {
    expect(registerTenantSchema.safeParse(valid).success).toBe(true);
  });

  it('requires structured address fields (addressLine1, district, state, pincode)', () => {
    const { addressLine1, ...noLine1 } = valid;
    void addressLine1;
    expect(registerTenantSchema.safeParse(noLine1).success).toBe(false);
  });

  it('rejects a malformed PIN code', () => {
    expect(registerTenantSchema.safeParse({ ...valid, pincode: '12' }).success).toBe(false);
  });

  it('accepts a valid GST number', () => {
    expect(registerTenantSchema.safeParse({ ...valid, gstNumber: '29ABCDE1234F1Z5' }).success).toBe(
      true,
    );
  });

  it('rejects a malformed GST number', () => {
    expect(registerTenantSchema.safeParse({ ...valid, gstNumber: 'NOTAGST' }).success).toBe(false);
  });

  it('rejects a malformed admin phone number', () => {
    expect(registerTenantSchema.safeParse({ ...valid, phoneNumber: 'abc' }).success).toBe(false);
  });
});

describe('registerStaffSchema', () => {
  const valid = {
    firstName: 'Suresh',
    lastName: 'Babu',
    phoneNumber: '+919876543220',
    companyCode: 'fcc-7a91kd',
    ...validAddress,
  };

  it('accepts a valid staff registration without email', () => {
    const result = registerStaffSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
      expect(result.data.companyCode).toBe('FCC-7A91KD'); // uppercased
    }
  });

  it('accepts a valid optional email', () => {
    expect(registerStaffSchema.safeParse({ ...valid, email: 'suresh@example.com' }).success).toBe(
      true,
    );
  });

  it('rejects a malformed optional email', () => {
    expect(registerStaffSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('requires a company code', () => {
    expect(registerStaffSchema.safeParse({ ...valid, companyCode: '' }).success).toBe(false);
  });
});

describe('registerFarmOwnerSchema', () => {
  const valid = {
    firstName: 'Maya',
    lastName: 'Rao',
    phoneNumber: '+919876543230',
    companyCode: 'FCC-7A91KD',
    ...validAddress,
    gpsLatitude: 11.0168,
    gpsLongitude: 76.9558,
  };

  it('accepts a valid farm-owner registration with GPS', () => {
    expect(registerFarmOwnerSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a farm-owner registration without GPS (optional)', () => {
    const { gpsLatitude, gpsLongitude, ...withoutGps } = valid;
    void gpsLatitude;
    void gpsLongitude;
    expect(registerFarmOwnerSchema.safeParse(withoutGps).success).toBe(true);
  });

  it('rejects an out-of-range latitude', () => {
    expect(registerFarmOwnerSchema.safeParse({ ...valid, gpsLatitude: 200 }).success).toBe(false);
  });
});
