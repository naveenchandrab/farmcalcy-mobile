import { z } from 'zod';

import type { User, UserRole, UserStatus } from '@app-types';
import { OTP_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@constants';

import { isPasswordValid } from '../utils/passwordPolicy';

// ─── Shared field schemas ──────────────────────────────────────────────────────

const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(255, 'Email is too long')
  .email('Enter a valid email address');

const otpField = z
  .string()
  .trim()
  .min(1, 'Enter the OTP sent to your email')
  .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
  .regex(/^\d+$/, 'OTP must contain digits only');

/** Strong-password field used wherever the user chooses a NEW password. */
const newPasswordField = z
  .string()
  .min(1, 'Password is required')
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .refine(isPasswordValid, {
    message: 'Password must include uppercase, lowercase and a number',
  });

// ─── Login ─────────────────────────────────────────────────────────────────────
//
// Backend contract: POST /auth/login { email, password } (LoginDto).
// There is no "company code" or "username" field on the server — login is by email.

export const loginSchema = z.object({
  email: emailField,
  // On login we only validate presence/length, never the strong-password policy:
  // existing accounts may predate the current policy.
  password: z
    .string()
    .min(1, 'Password is required')
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
  rememberMe: z.boolean().optional().default(true),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register ──────────────────────────────────────────────────────────────────
//
// Self-service registration is not yet exposed by the backend; this schema backs
// the existing RegisterScreen placeholder and is kept for forward compatibility.

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required').min(3, 'Enter your full name'),
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(values => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Forgot Password ───────────────────────────────────────────────────────────
//
// Backend contract: POST /auth/forgot-password { email }. Always returns 200.

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ─── OTP Verification ──────────────────────────────────────────────────────────
//
// The OTP is verified-and-consumed server-side at reset time (POST /auth/reset-password),
// so this screen only validates the OTP format and carries it forward.

export const otpSchema = z.object({
  otp: otpField,
});

export type OtpFormValues = z.infer<typeof otpSchema>;

// ─── Reset Password ────────────────────────────────────────────────────────────
//
// Backend contract: POST /auth/reset-password { email, otp, newPassword, confirmPassword }.

export const resetPasswordSchema = z
  .object({
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(values => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// ─── Change Password (forced first-login change) ───────────────────────────────
//
// Backend contract: POST /auth/change-password { currentPassword, newPassword,
// confirmPassword, otp? }. OTP is required when the account has mustChangePassword.

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    otp: otpField,
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(values => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(values => values.newPassword !== values.currentPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// ─── OTP purposes (mirrors Prisma OtpPurpose enum) ─────────────────────────────

export const OtpPurpose = {
  ForgotPassword: 'FORGOT_PASSWORD',
  PasswordChange: 'PASSWORD_CHANGE',
} as const;

export type OtpPurpose = (typeof OtpPurpose)[keyof typeof OtpPurpose];

// ─── API Request payloads (exact backend shapes) ───────────────────────────────

export interface LoginApiRequest {
  email: string;
  password: string;
}

export interface LogoutApiRequest {
  refreshToken: string;
}

export interface ForgotPasswordApiRequest {
  email: string;
}

export interface ResetPasswordApiRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordApiRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  otp: string;
}

export interface SendOtpApiRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpApiRequest {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

// ─── API Response payloads (exact backend shapes) ──────────────────────────────

/**
 * User object returned inside the login / refresh envelope (UserInfoDto).
 * Note: the backend returns `roleName` (not `role`) and omits phone/timestamps —
 * use `mapAuthUserToUser` to convert it to the app-wide `User` type.
 */
export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  roleName: string;
  status: string;
  mustChangePassword: boolean;
  companyId: string | null;
}

export interface LoginApiResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}

export interface ChangePasswordApiResponse {
  accessToken: string;
  refreshToken: string;
}

/** Forgot-password / reset-password / otp endpoints return `{ message }`. */
export interface MessageResponse {
  message: string;
}

// ─── Mapper: backend AuthUserDto → app User ────────────────────────────────────

const KNOWN_ROLES: readonly UserRole[] = [
  'SAAS_ADMIN',
  'TENANT_ADMIN',
  'SUPERVISOR',
  'FARMER',
];

const KNOWN_STATUSES: readonly UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export const mapAuthUserToUser = (dto: AuthUserDto): User => {
  const nowIso = new Date().toISOString();
  const role = (KNOWN_ROLES as readonly string[]).includes(dto.roleName)
    ? (dto.roleName as UserRole)
    : 'FARMER';
  const status = (KNOWN_STATUSES as readonly string[]).includes(dto.status)
    ? (dto.status as UserStatus)
    : 'ACTIVE';

  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role,
    status,
    companyId: dto.companyId ?? undefined,
    mustChangePassword: dto.mustChangePassword,
    // The login envelope omits timestamps; they are hydrated later by GET /auth/me.
    createdAt: nowIso,
    updatedAt: nowIso,
  };
};
