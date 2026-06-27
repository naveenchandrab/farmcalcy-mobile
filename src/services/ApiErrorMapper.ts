import type { ApiErrorCode } from '@app-types';

/**
 * Translates transport- and HTTP-level failures into safe, user-facing strings.
 *
 * The NestJS backend returns errors as
 *   { success: false, message: string, errors: string[], timestamp, path }
 * (see GlobalExceptionFilter) — there is no machine `errorCode`, so this mapper
 * is driven primarily by the HTTP status code. Raw server messages for 5xx are
 * never surfaced; validation arrays (class-validator) are safe and are shown for
 * 400/422 because they are field-level and user-actionable.
 */

// ─── Public types ──────────────────────────────────────────────────────────────

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'unknown';

export interface NormalizedApiError {
  /** HTTP status code, or null when the request never reached the server. */
  readonly status: number | null;
  readonly kind: ApiErrorKind;
  /** A safe, user-friendly message ready to display. */
  readonly message: string;
  /** Field-level validation messages from the backend `errors[]`, if any. */
  readonly fieldErrors: readonly string[];
}

// ─── Status → friendly message defaults ────────────────────────────────────────

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Please check the details you entered and try again.',
  401: 'Authentication failed. Please check your details and try again.',
  403: 'You do not have permission to perform this action.',
  404: 'We could not find what you were looking for.',
  409: 'This action conflicts with existing data. Please refresh and try again.',
  422: 'Some of the information looks invalid. Please review and try again.',
  429: 'Too many attempts. Please wait a moment before trying again.',
};

const NETWORK_MESSAGE =
  'Unable to connect to the server. Please check your internet connection and try again.';
const TIMEOUT_MESSAGE = 'The request timed out. Please try again.';
const SERVER_MESSAGE = 'Something went wrong on our end. Please try again shortly.';
const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

// ─── Core normalisation ────────────────────────────────────────────────────────

/**
 * Reduces any thrown value (Axios error, network failure, etc.) into a single
 * normalised shape that screens and hooks can branch on without touching Axios.
 */
export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (isErrorWithResponse(error)) {
    const status = error.response.status;
    const fieldErrors = extractFieldErrors(error.response.data);

    if (status >= 500) {
      return { status, kind: 'http', message: SERVER_MESSAGE, fieldErrors };
    }

    // For validation failures, the field messages are the most actionable text.
    if ((status === 400 || status === 422) && fieldErrors.length > 0) {
      return { status, kind: 'http', message: fieldErrors[0], fieldErrors };
    }

    return {
      status,
      kind: 'http',
      message: STATUS_MESSAGES[status] ?? FALLBACK_MESSAGE,
      fieldErrors,
    };
  }

  if (isTimeoutError(error)) {
    return { status: null, kind: 'timeout', message: TIMEOUT_MESSAGE, fieldErrors: [] };
  }

  if (isNetworkError(error)) {
    return { status: null, kind: 'network', message: NETWORK_MESSAGE, fieldErrors: [] };
  }

  return { status: null, kind: 'unknown', message: FALLBACK_MESSAGE, fieldErrors: [] };
};

/**
 * Returns a display string for any error.
 *
 * @param error      The thrown value.
 * @param overrides  Optional per-status message overrides so a caller can give
 *                   flow-specific copy (e.g. 401 on login → "Invalid email or
 *                   password") without leaking raw backend text.
 */
export const extractErrorMessage = (
  error: unknown,
  overrides?: Partial<Record<number, string>>,
): string => {
  const normalized = normalizeApiError(error);

  if (overrides && normalized.status !== null && overrides[normalized.status]) {
    return overrides[normalized.status] as string;
  }

  return normalized.message;
};

/** Convenience accessor for callers that branch purely on status. */
export const getErrorStatus = (error: unknown): number | null =>
  normalizeApiError(error).status;

// ─── Backward-compatible error-code mapper ─────────────────────────────────────
//
// Retained for forward compatibility: if the backend later adds an `errorCode`
// field, callers can map it without another refactor.

const ERROR_CODE_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_PASSWORD: 'The password you entered is incorrect.',
  USER_NOT_FOUND: 'No account found with these credentials.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_OTP: 'The OTP you entered is incorrect.',
  OTP_EXPIRED: 'The OTP has expired. Please request a new one.',
  COMPANY_SUSPENDED: 'Your company account has been suspended. Please contact support.',
  SUBSCRIPTION_EXPIRED: 'Your subscription has expired. Please renew to continue.',
  NETWORK_ERROR: NETWORK_MESSAGE,
  TIMEOUT: TIMEOUT_MESSAGE,
  SERVER_ERROR: SERVER_MESSAGE,
  UNKNOWN: FALLBACK_MESSAGE,
};

export const mapApiErrorCode = (errorCode: string | undefined): string => {
  if (!errorCode) {
    return FALLBACK_MESSAGE;
  }
  return ERROR_CODE_MESSAGES[errorCode as ApiErrorCode] ?? FALLBACK_MESSAGE;
};

// ─── Type guards ───────────────────────────────────────────────────────────────

interface ErrorWithResponse {
  response: {
    status: number;
    data?: {
      success?: boolean;
      message?: string;
      errors?: unknown;
    };
  };
}

const isErrorWithResponse = (error: unknown): error is ErrorWithResponse =>
  typeof error === 'object' &&
  error !== null &&
  'response' in error &&
  typeof (error as ErrorWithResponse).response === 'object' &&
  (error as ErrorWithResponse).response !== null &&
  typeof (error as ErrorWithResponse).response.status === 'number';

const extractFieldErrors = (data: ErrorWithResponse['response']['data']): string[] => {
  if (data && Array.isArray(data.errors)) {
    return data.errors.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

const isNetworkError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  (error as { message?: unknown }).message === 'Network Error';

const isTimeoutError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: unknown }).code === 'ECONNABORTED';
