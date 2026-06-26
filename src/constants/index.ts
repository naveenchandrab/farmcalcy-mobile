// ─── API ─────────────────────────────────────────────────────────────────────

export const API_TIMEOUT_MS = 30_000;

/** Endpoints that must never receive an Authorization header. */
export const AUTH_SKIP_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/forgot-password'];

export const REFRESH_TOKEN_ENDPOINT = '/auth/refresh';

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
