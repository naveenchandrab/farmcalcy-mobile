/**
 * Reusable API error/response builders.
 *
 * These mimic the exact shapes Axios throws/returns so tests exercise the real
 * `ApiErrorMapper` branches (network, timeout, 4xx with field errors, 5xx) without
 * hand-rolling error objects in every test.
 *
 * Usage:
 *   mockAxios.post.mockRejectedValueOnce(httpError(401));
 *   mockAxios.post.mockRejectedValueOnce(networkError());
 */
import type { ApiResponse } from '@app-types';

interface BackendErrorBody {
  success: false;
  message: string;
  errors?: string[];
  timestamp?: string;
  path?: string;
}

/** An Axios-shaped HTTP error with a server response (status >= 400). */
export const httpError = (
  status: number,
  body: Partial<BackendErrorBody> = {},
): { response: { status: number; data: BackendErrorBody }; isAxiosError: true } => ({
  isAxiosError: true,
  response: {
    status,
    data: {
      success: false,
      message: body.message ?? 'Request failed',
      errors: body.errors,
      timestamp: '2026-06-27T00:00:00.000Z',
      path: '/auth/login',
    },
  },
});

/** A 400/422 validation error carrying field-level messages (class-validator). */
export const validationError = (
  messages: string[],
  status: 400 | 422 = 400,
): ReturnType<typeof httpError> =>
  httpError(status, { message: 'Validation failed', errors: messages });

/** Connection failure — request never reached the server. */
export const networkError = (): { message: 'Network Error'; isAxiosError: true } => ({
  isAxiosError: true,
  message: 'Network Error',
});

/** Request aborted by the client timeout (axios `ECONNABORTED`). */
export const timeoutError = (): {
  code: 'ECONNABORTED';
  message: string;
  isAxiosError: true;
} => ({
  isAxiosError: true,
  code: 'ECONNABORTED',
  message: 'timeout of 30000ms exceeded',
});

/** Wraps a payload in the backend `{ success, message, data }` envelope. */
export const apiEnvelope = <T>(data: T, message = 'OK'): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

/** Builds the Axios `{ data }` response object services destructure. */
export const axiosResponse = <T>(data: T, message = 'OK'): { data: ApiResponse<T> } => ({
  data: apiEnvelope(data, message),
});
