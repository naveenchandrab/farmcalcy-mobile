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

/** International phone: optional leading +, 7–15 digits. Mirrors the backend regex. */
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

/** Returns true when the value is a syntactically valid email address. */
const looksLikeEmail = (value: string): boolean => z.string().email().safeParse(value).success;

/** Returns true when the value is a syntactically valid phone number. */
export const looksLikePhone = (value: string): boolean => PHONE_REGEX.test(value);

/**
 * Login identifier — accepts EITHER an email address OR a phone number.
 * The backend auto-detects the type (LoginDto.identifier).
 */
const identifierField = z
  .string()
  .trim()
  .min(1, 'Email or mobile number is required')
  .max(255, 'Email or mobile number is too long')
  .refine(value => looksLikeEmail(value) || looksLikePhone(value), {
    message: 'Enter a valid email address or mobile number',
  });

/** Optional email (supervisor / farm-owner registration — email is optional). */
const optionalEmailField = z
  .union([z.literal(''), emailField])
  .optional()
  .transform(value => (value === '' ? undefined : value));

/** Required name part (first / last name). */
const nameField = (label: string) =>
  z.string().trim().min(1, `${label} is required`).max(100, `${label} is too long`);

/** Required phone number field. */
const phoneField = z
  .string()
  .trim()
  .min(1, 'Mobile number is required')
  .regex(PHONE_REGEX, 'Enter a valid mobile number (7–15 digits)');

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
// Backend contract: POST /auth/login { identifier, password } (LoginDto).
// `identifier` is auto-detected as an email OR a phone number server-side.

export const loginSchema = z.object({
  identifier: identifierField,
  // On login we only validate presence/length, never the strong-password policy:
  // existing accounts may predate the current policy.
  password: z
    .string()
    .min(1, 'Password is required')
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
  rememberMe: z.boolean().optional().default(true),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Registration (approval workflow) ──────────────────────────────────────────
//
// Self-service registration creates a PENDING request; the account is provisioned
// only after a reviewer approves it. No password is collected — a temporary one is
// generated on approval. Backend: POST /registrations/{tenant,supervisor,farm-owner}.

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const optionalGstField = z
  .union([
    z.literal(''),
    z.string().trim().regex(GST_REGEX, 'Enter a valid 15-character GST number'),
  ])
  .optional()
  .transform(value => (value === '' ? undefined : value));

const companyCodeField = z
  .string()
  .trim()
  .min(3, 'Enter the company code')
  .max(20, 'Company code is too long')
  .transform(value => value.toUpperCase());

// ── Structured address (shared by company + supervisor + farm-owner) ───────────

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/** Optional free-text address part; empty string → undefined. */
const optionalAddrField = (max = 150) =>
  z
    .union([z.literal(''), z.string().trim().max(max, 'This value is too long')])
    .optional()
    .transform(value => (value === '' ? undefined : value));

/** Reusable address shape spread into each registration schema. */
const addressShape = {
  addressLine1: z.string().trim().min(2, 'Address line 1 is required').max(150, 'Too long'),
  addressLine2: optionalAddrField(),
  taluk: optionalAddrField(100),
  village: optionalAddrField(100),
  landmark: optionalAddrField(),
  district: z.string().trim().min(2, 'District is required').max(100, 'Too long'),
  state: z.string().trim().min(2, 'State is required').max(100, 'Too long'),
  pincode: z.string().trim().regex(PINCODE_REGEX, 'Enter a valid 6-digit PIN code'),
};

/** Upload reference (server-side path) captured after an Aadhaar image upload. */
const uploadRefField = z.string().trim().max(255).optional();

/** Tenant (company) registration — company + owner (as per Aadhaar) + structured address. */
export const registerTenantSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name is required')
    .max(150, 'Company name is too long'),
  companyEmail: emailField,
  companyPhone: phoneField,
  ...addressShape,
  gstNumber: optionalGstField,
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  adminEmail: emailField,
  phoneNumber: phoneField,
  aadhaarFrontUrl: uploadRefField,
  aadhaarBackUrl: uploadRefField,
});

export type RegisterTenantFormValues = z.infer<typeof registerTenantSchema>;

/** Supervisor / farm-owner shared fields — personal details + structured address. */
export const registerStaffSchema = z.object({
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  phoneNumber: phoneField,
  email: optionalEmailField,
  companyCode: companyCodeField,
  ...addressShape,
});

export type RegisterStaffFormValues = z.infer<typeof registerStaffSchema>;

/** Farm-owner registration — staff fields plus the farm's GPS location. */
export const registerFarmOwnerSchema = registerStaffSchema.extend({
  gpsLatitude: z.number().min(-90).max(90).optional(),
  gpsLongitude: z.number().min(-180).max(180).optional(),
});

export type RegisterFarmOwnerFormValues = z.infer<typeof registerFarmOwnerSchema>;

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
  /** Email address OR phone number — auto-detected server-side. */
  identifier: string;
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

const KNOWN_ROLES: readonly UserRole[] = ['SAAS_ADMIN', 'TENANT_ADMIN', 'SUPERVISOR', 'FARMER'];

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
