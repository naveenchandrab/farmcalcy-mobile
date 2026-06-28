/**
 * Factory functions for auth test data.
 *
 * Every factory returns a fully-valid object and accepts a partial override, so
 * a test only states what is relevant to it (Arrange step stays tiny):
 *
 *   const user = makeAuthUserDto({ mustChangePassword: true });
 *
 * Keeping the canonical shapes here means a backend contract change is updated
 * in ONE place rather than across dozens of tests.
 */
import type { AuthTokens, User } from '@app-types';
import type {
  AuthUserDto,
  ChangePasswordApiResponse,
  LoginApiResponse,
} from '@features/auth/types';

let seq = 0;
const nextId = (prefix: string): string => `${prefix}-${(seq += 1)}`;

/** Backend UserInfoDto returned inside the login envelope. */
export const makeAuthUserDto = (overrides: Partial<AuthUserDto> = {}): AuthUserDto => ({
  id: nextId('user'),
  name: 'Rajesh Kumar',
  email: 'rajesh@abcpoultry.com',
  roleName: 'TENANT_ADMIN',
  status: 'ACTIVE',
  mustChangePassword: false,
  companyId: nextId('company'),
  ...overrides,
});

/** App-wide User domain object. */
export const makeUser = (overrides: Partial<User> = {}): User => {
  const now = new Date('2026-06-27T00:00:00.000Z').toISOString();
  return {
    id: nextId('user'),
    name: 'Rajesh Kumar',
    email: 'rajesh@abcpoultry.com',
    role: 'TENANT_ADMIN',
    status: 'ACTIVE',
    companyId: nextId('company'),
    mustChangePassword: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

export const makeTokens = (overrides: Partial<AuthTokens> = {}): AuthTokens => ({
  accessToken: 'access-token-abc123',
  refreshToken: 'refresh-token-xyz789',
  ...overrides,
});

export const makeLoginResponse = (
  overrides: Partial<LoginApiResponse> = {},
): LoginApiResponse => ({
  accessToken: 'access-token-abc123',
  refreshToken: 'refresh-token-xyz789',
  user: makeAuthUserDto(),
  ...overrides,
});

export const makeChangePasswordResponse = (
  overrides: Partial<ChangePasswordApiResponse> = {},
): ChangePasswordApiResponse => ({
  accessToken: 'new-access-token',
  refreshToken: 'new-refresh-token',
  ...overrides,
});

/** Valid credentials / values that satisfy the zod schemas. */
export const validCredentials = {
  email: 'rajesh@abcpoultry.com',
  password: 'Password123',
  strongPassword: 'NewStr0ngPass',
  otp: '123456',
} as const;
