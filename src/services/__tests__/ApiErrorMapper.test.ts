import { httpError, networkError, timeoutError, validationError } from '@test-utils';

import {
  extractErrorMessage,
  getErrorStatus,
  mapApiErrorCode,
  normalizeApiError,
} from '../ApiErrorMapper';

/**
 * ApiErrorMapper is the single funnel that turns any thrown value into safe,
 * user-facing copy. Every hook depends on it, so its branches are pinned here:
 * network / timeout / 5xx (never leak raw text) / 4xx field errors / overrides.
 */
describe('normalizeApiError', () => {
  it('classifies a network failure', () => {
    const result = normalizeApiError(networkError());
    expect(result.kind).toBe('network');
    expect(result.status).toBeNull();
    expect(result.message).toMatch(/internet connection/i);
  });

  it('classifies a timeout', () => {
    const result = normalizeApiError(timeoutError());
    expect(result.kind).toBe('timeout');
    expect(result.message).toMatch(/timed out/i);
  });

  it('never surfaces the raw server message for 5xx', () => {
    const result = normalizeApiError(
      httpError(500, { message: 'TypeError: cannot read property x of undefined' }),
    );
    expect(result.kind).toBe('http');
    expect(result.message).toBe('Something went wrong on our end. Please try again shortly.');
    expect(result.message).not.toMatch(/TypeError/);
  });

  it('surfaces the first field error for a 400 validation failure', () => {
    const result = normalizeApiError(
      validationError(['email must be an email', 'password too short']),
    );
    expect(result.message).toBe('email must be an email');
    expect(result.fieldErrors).toHaveLength(2);
  });

  it('uses the status default message for a 401 with no field errors', () => {
    expect(normalizeApiError(httpError(401)).message).toMatch(/authentication failed/i);
  });

  it('falls back for an unknown thrown value', () => {
    const result = normalizeApiError('a bare string');
    expect(result.kind).toBe('unknown');
    expect(result.message).toBe('Something went wrong. Please try again.');
  });
});

describe('extractErrorMessage', () => {
  it('applies a per-status override when provided', () => {
    const message = extractErrorMessage(httpError(401), {
      401: 'The email or password you entered is incorrect.',
    });
    expect(message).toBe('The email or password you entered is incorrect.');
  });

  it('ignores overrides that do not match the status', () => {
    const message = extractErrorMessage(httpError(403), {
      401: 'wrong',
    });
    expect(message).toMatch(/do not have permission/i);
  });

  it('returns the normalized message when no override applies', () => {
    expect(extractErrorMessage(networkError())).toMatch(/internet connection/i);
  });
});

describe('getErrorStatus', () => {
  it('returns the HTTP status for a server error', () => {
    expect(getErrorStatus(httpError(429))).toBe(429);
  });

  it('returns null for a transport error', () => {
    expect(getErrorStatus(networkError())).toBeNull();
  });
});

describe('mapApiErrorCode (forward-compat)', () => {
  it('maps a known error code', () => {
    expect(mapApiErrorCode('OTP_EXPIRED')).toMatch(/expired/i);
  });

  it('falls back for an undefined code', () => {
    expect(mapApiErrorCode(undefined)).toBe('Something went wrong. Please try again.');
  });

  it('falls back for an unrecognised code', () => {
    expect(mapApiErrorCode('NOPE')).toBe('Something went wrong. Please try again.');
  });
});
