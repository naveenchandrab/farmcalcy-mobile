import type { ApiErrorCode } from '@app-types';

/**
 * Maps backend error codes to human-readable English strings.
 *
 * Design intent: keys are backend ApiErrorCode values; values are the
 * display strings shown to the user. When i18n is introduced, replace
 * the string values with i18n keys and run them through the translator.
 */
const ERROR_MESSAGE_MAP: Record<ApiErrorCode, string> = {
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'The password you entered is incorrect.',
  USER_NOT_FOUND: 'No account found with these credentials.',
  USER_ALREADY_EXISTS: 'An account with this email already exists.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_INVALID: 'Your session is invalid. Please log in again.',
  TOKEN_MISSING: 'Authentication is required. Please log in.',
  REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  REFRESH_TOKEN_INVALID: 'Your session is invalid. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource could not be found.',
  VALIDATION_FAILED: 'Please check the form and correct the highlighted errors.',
  COMPANY_NOT_FOUND: 'Company account not found.',
  COMPANY_SUSPENDED: 'Your company account has been suspended. Please contact support.',
  SUBSCRIPTION_EXPIRED: 'Your subscription has expired. Please renew to continue.',
  INVALID_OTP: 'The OTP you entered is incorrect.',
  OTP_EXPIRED: 'The OTP has expired. Please request a new one.',
  MUST_CHANGE_PASSWORD: 'You must set a new password before continuing.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT: 'The request timed out. Please try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

const FALLBACK_MESSAGE = ERROR_MESSAGE_MAP.UNKNOWN;

/**
 * Returns a user-friendly error message for the given backend error code.
 * Falls back to the UNKNOWN message for any unrecognised code, making the
 * mapper forward-compatible with new backend codes that haven't been added yet.
 */
export const mapApiErrorCode = (errorCode: string | undefined): string => {
  if (!errorCode) {
    return FALLBACK_MESSAGE;
  }
  return ERROR_MESSAGE_MAP[errorCode as ApiErrorCode] ?? FALLBACK_MESSAGE;
};

/**
 * Extracts the most relevant message to display from an Axios error object.
 * Checks the backend error envelope first, then falls back through network
 * and timeout signals, and finally uses the UNKNOWN fallback.
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!isErrorWithResponse(error)) {
    if (isNetworkError(error)) {
      return ERROR_MESSAGE_MAP.NETWORK_ERROR;
    }
    if (isTimeoutError(error)) {
      return ERROR_MESSAGE_MAP.TIMEOUT;
    }
    return FALLBACK_MESSAGE;
  }

  const { data } = error.response;

  // Backend sent a known error code — prefer mapped message
  if (data?.errorCode) {
    return mapApiErrorCode(data.errorCode);
  }

  // Backend sent a plain message — use it directly
  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }

  return FALLBACK_MESSAGE;
};

// ─── Type Guards ──────────────────────────────────────────────────────────────

interface ErrorWithResponse {
  response: {
    status: number;
    data: {
      success?: boolean;
      message?: string;
      errorCode?: string;
    };
  };
}

const isErrorWithResponse = (error: unknown): error is ErrorWithResponse =>
  typeof error === 'object' &&
  error !== null &&
  'response' in error &&
  typeof (error as ErrorWithResponse).response === 'object';

const isNetworkError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  (error as { message: string }).message === 'Network Error';

const isTimeoutError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: string }).code === 'ECONNABORTED';
