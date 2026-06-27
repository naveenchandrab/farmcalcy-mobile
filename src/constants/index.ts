// ─── API ─────────────────────────────────────────────────────────────────────

export const API_TIMEOUT_MS = 30_000;

/**
 * Endpoints that must never receive an Authorization header.
 * These are the unauthenticated auth/OTP flows; `/auth/change-password` is
 * intentionally excluded because it requires a valid Bearer token.
 */
export const AUTH_SKIP_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/otp/send',
  '/otp/verify',
];

export const REFRESH_TOKEN_ENDPOINT = '/auth/refresh';

// ─── Auth / OTP ────────────────────────────────────────────────────────────────

/** Number of digits in an OTP (matches backend OtpRecord / VerifyOtpDto). */
export const OTP_LENGTH = 6;

/** OTP validity window in minutes (matches backend OTP_EXPIRY_MINUTES). */
export const OTP_EXPIRY_MINUTES = 10;

/** Cooldown before the user may request a new OTP, in seconds. */
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

/** Password length policy (matches backend Reset/ChangePasswordDto). */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** AsyncStorage key for the remembered login email (never the password). */
export const STORAGE_KEY_REMEMBERED_EMAIL = 'farmcalcy:remembered-email';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

/** Keychain service name — must match across iOS Keychain & Android Keystore. */
export const KEYCHAIN_SERVICE = 'com.farmcalcy.pcfms';

/** Key used to store the serialised User object in AsyncStorage / MMKV. */
export const STORAGE_KEY_USER = 'farmcalcy:user';

/** Key used to persist the selected theme mode. */
export const STORAGE_KEY_THEME = 'farmcalcy:theme';

// ─── UI ──────────────────────────────────────────────────────────────────────

export const TOAST_DURATION_MS = 3_000;

export const DEFAULT_PAGE_SIZE = 20;

// ─── Roles ───────────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  SAAS_ADMIN: 'SaaS Admin',
  TENANT_ADMIN: 'Company Admin',
  SUPERVISOR: 'Supervisor',
  FARMER: 'Farm Owner',
};
